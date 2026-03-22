import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const HOST = process.env.SHARED_FEED_HOST || '0.0.0.0';
const PORT = Number(process.env.SHARED_FEED_PORT || 8787);
const TOKEN = (process.env.SHARED_FEED_TOKEN || '').trim();
const ALLOW_ORIGIN = (process.env.SHARED_FEED_ALLOW_ORIGIN || '*').trim() || '*';
const DATA_FILE = process.env.SHARED_FEED_FILE
  ? path.resolve(process.cwd(), process.env.SHARED_FEED_FILE)
  : path.resolve(process.cwd(), 'server', 'shared-feed.json');

const defaultState = {
  featuredOverrides: [],
  registeredEntities: [],
  boosts: {},
  deletedFeaturedIds: [],
  deletedEntityIds: [],
};

const allowedContentTypes = new Set(['text', 'image', 'video']);
const allowedModes = new Set(['latest', 'pinned', 'specific', 'manual']);
const allowedEntityTypes = new Set(['channel', 'app']);
const allowedBoostStatuses = new Set(['inactive', 'pending', 'active', 'failed']);
const allowedBoostSources = new Set(['mock', 'ton']);
const EXPLICITLY_REMOVED_ENTITY_IDS = new Set([
  'custom-1774173646049',
  'custom-1774175241878',
]);
const TEST_LIKE_PATTERN = /\b(test\w*|demo\w*|placeholder)\b/i;

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toOptionalString = (value) => {
  return typeof value === 'string' && value.trim() ? value : undefined;
};

const toScore = (value, fallback) => {
  return Number.isFinite(value) ? Number(value) : fallback;
};

const sanitizeTags = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const sanitizeIdList = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const hasTestLikeText = (value) => {
  return typeof value === 'string' && TEST_LIKE_PATTERN.test(value);
};

const sanitizeFeaturedItem = (value) => {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.id !== 'string'
    || typeof value.entityId !== 'string'
    || !allowedModes.has(value.mode)
    || !allowedContentTypes.has(value.contentType)
  ) {
    return null;
  }

  return {
    id: value.id,
    entityId: value.entityId,
    mode: value.mode,
    contentType: value.contentType,
    title: toOptionalString(value.title),
    text: toOptionalString(value.text),
    mediaUrl: toOptionalString(value.mediaUrl),
  };
};

const sanitizeEntityItem = (value) => {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.id !== 'string'
    || !allowedEntityTypes.has(value.type)
    || typeof value.name !== 'string'
    || typeof value.category !== 'string'
    || typeof value.shortDescription !== 'string'
    || typeof value.telegramUrl !== 'string'
    || !allowedContentTypes.has(value.contentType)
  ) {
    return null;
  }

  return {
    id: value.id,
    type: value.type,
    name: value.name,
    category: value.category,
    tags: sanitizeTags(value.tags),
    shortDescription: value.shortDescription,
    longDescription: toOptionalString(value.longDescription),
    telegramUrl: value.telegramUrl,
    contentType: value.contentType,
    previewText: toOptionalString(value.previewText),
    previewMediaUrl: toOptionalString(value.previewMediaUrl),
    editorialScore: toScore(value.editorialScore, 55),
    activityScore: toScore(value.activityScore, 30),
    engagementScore: toScore(value.engagementScore, 25),
  };
};

const sanitizeBoostItem = (entityId, value) => {
  if (!isRecord(value) || typeof entityId !== 'string') {
    return null;
  }

  if (!allowedBoostStatuses.has(value.status)) {
    return null;
  }

  return {
    entityId: typeof value.entityId === 'string' ? value.entityId : entityId,
    status: value.status,
    startedAt: toOptionalString(value.startedAt),
    expiresAt: toOptionalString(value.expiresAt),
    source: allowedBoostSources.has(value.source) ? value.source : 'mock',
  };
};

const isExplicitlyRemovedEntity = (entity) => {
  if (!isRecord(entity) || typeof entity.id !== 'string') {
    return false;
  }

  return EXPLICITLY_REMOVED_ENTITY_IDS.has(entity.id);
};

const isTestLikeEntity = (entity) => {
  if (!isRecord(entity) || typeof entity.id !== 'string') {
    return false;
  }

  return hasTestLikeText(entity.name)
    || hasTestLikeText(entity.shortDescription)
    || hasTestLikeText(entity.longDescription)
    || hasTestLikeText(entity.telegramUrl)
    || hasTestLikeText(entity.previewText)
    || hasTestLikeText(entity.previewMediaUrl)
    || sanitizeTags(entity.tags).some((tag) => hasTestLikeText(tag));
};

const isTestLikeFeatured = (item, removedEntityIdSet) => {
  if (!isRecord(item) || typeof item.entityId !== 'string') {
    return false;
  }

  if (removedEntityIdSet.has(item.entityId)) {
    return true;
  }

  // Keep imported Telegram feed items intact; only strip custom test/demo content.
  if (!item.entityId.startsWith('custom-')) {
    return false;
  }

  return hasTestLikeText(item.title)
    || hasTestLikeText(item.text)
    || hasTestLikeText(item.mediaUrl);
};

const sanitizeState = (value) => {
  if (!isRecord(value)) {
    return defaultState;
  }

  const featuredOverrides = Array.isArray(value.featuredOverrides)
    ? value.featuredOverrides.map(sanitizeFeaturedItem).filter(Boolean)
    : [];
  const registeredEntities = Array.isArray(value.registeredEntities)
    ? value.registeredEntities.map(sanitizeEntityItem).filter(Boolean)
    : [];
  const boosts = isRecord(value.boosts)
    ? Object.fromEntries(
      Object.entries(value.boosts)
        .map(([entityId, boostValue]) => [entityId, sanitizeBoostItem(entityId, boostValue)])
        .filter(([, boostState]) => Boolean(boostState)),
    )
    : {};

  const explicitlyRemovedEntityIds = registeredEntities
    .filter((entity) => isExplicitlyRemovedEntity(entity))
    .map((entity) => entity.id);
  const testLikeEntityIds = registeredEntities
    .filter((entity) => isTestLikeEntity(entity))
    .map((entity) => entity.id);

  const deletedEntityIds = Array.from(new Set([
    ...sanitizeIdList(value.deletedEntityIds),
    ...explicitlyRemovedEntityIds,
    ...testLikeEntityIds,
    ...Array.from(EXPLICITLY_REMOVED_ENTITY_IDS),
  ]));
  const deletedEntityIdSet = new Set(deletedEntityIds);

  const testLikeFeaturedIds = featuredOverrides
    .filter((item) => isTestLikeFeatured(item, deletedEntityIdSet))
    .map((item) => item.id);

  const deletedFeaturedIds = Array.from(new Set([
    ...sanitizeIdList(value.deletedFeaturedIds),
    ...testLikeFeaturedIds,
    ...featuredOverrides
      .filter((item) => deletedEntityIdSet.has(item.entityId))
      .map((item) => item.id),
  ]));
  const deletedFeaturedIdSet = new Set(deletedFeaturedIds);

  const nextFeaturedOverrides = featuredOverrides.filter((item) => {
    return !deletedEntityIdSet.has(item.entityId)
      && !deletedFeaturedIdSet.has(item.id)
      && !isTestLikeFeatured(item, deletedEntityIdSet);
  });
  const nextRegisteredEntities = registeredEntities.filter((entity) => {
    return !deletedEntityIdSet.has(entity.id)
      && !isExplicitlyRemovedEntity(entity)
      && !isTestLikeEntity(entity);
  });
  const validTargetIds = new Set([
    ...nextRegisteredEntities.map((entity) => entity.id),
    ...nextFeaturedOverrides.map((item) => item.id),
  ]);
  const nextBoosts = Object.fromEntries(
    Object.entries(boosts).filter(([targetId]) => {
      return !deletedEntityIdSet.has(targetId)
        && !deletedFeaturedIdSet.has(targetId)
        && validTargetIds.has(targetId);
    }),
  );

  return {
    featuredOverrides: nextFeaturedOverrides,
    registeredEntities: nextRegisteredEntities,
    boosts: nextBoosts,
    deletedFeaturedIds,
    deletedEntityIds,
  };
};

const mergeById = (currentItems, incomingItems) => {
  const next = new Map();
  currentItems.forEach((item) => {
    next.set(item.id, item);
  });
  incomingItems.forEach((item) => {
    next.set(item.id, item);
  });
  return Array.from(next.values());
};

const ensureStorage = async () => {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await readFile(DATA_FILE, 'utf8');
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
  }
};

const readState = async () => {
  await ensureStorage();
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    return sanitizeState(JSON.parse(raw));
  } catch {
    return defaultState;
  }
};

const writeState = async (state) => {
  await ensureStorage();
  const tmpFile = `${DATA_FILE}.tmp`;
  await writeFile(tmpFile, JSON.stringify(state, null, 2), 'utf8');
  await rename(tmpFile, DATA_FILE);
};

const readBody = async (request) => {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) {
      throw new Error('Payload too large');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
};

const writeJson = (response, statusCode, payload, requestOrigin) => {
  const allowOrigin = ALLOW_ORIGIN === '*' ? '*' : requestOrigin || ALLOW_ORIGIN;
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Access-Control-Allow-Origin', allowOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  response.end(JSON.stringify(payload));
};

const isAuthorized = (request, url) => {
  if (!TOKEN) {
    return true;
  }
  const header = request.headers.authorization || '';
  const queryToken = url.searchParams.get('token') || '';
  return header === `Bearer ${TOKEN}` || queryToken === TOKEN;
};

const sseClients = new Set();

const broadcastSharedFeedUpdate = () => {
  if (sseClients.size === 0) {
    return;
  }
  const data = JSON.stringify({
    type: 'shared-feed-updated',
    timestamp: new Date().toISOString(),
  });
  sseClients.forEach((client) => {
    try {
      client.write(`event: shared-feed-updated\n`);
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  });
};

const sseHeartbeat = setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(': keepalive\n\n');
    } catch {
      sseClients.delete(client);
    }
  });
}, 20_000);

const server = createServer(async (request, response) => {
  const method = request.method || 'GET';
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const requestOrigin = typeof request.headers.origin === 'string' ? request.headers.origin : '';

  if (method === 'OPTIONS') {
    writeJson(response, 204, { ok: true }, requestOrigin);
    return;
  }

  if (url.pathname === '/health' && method === 'GET') {
    writeJson(response, 200, { ok: true }, requestOrigin);
    return;
  }

  if (url.pathname === '/shared-feed/events' && method === 'GET') {
    if (!isAuthorized(request, url)) {
      writeJson(response, 401, { error: 'Unauthorized' }, requestOrigin);
      return;
    }

    const allowOrigin = ALLOW_ORIGIN === '*' ? '*' : requestOrigin || ALLOW_ORIGIN;
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    response.write(': connected\n\n');
    sseClients.add(response);

    request.on('close', () => {
      sseClients.delete(response);
    });
    return;
  }

  if (url.pathname !== '/shared-feed') {
    writeJson(response, 404, { error: 'Not found' }, requestOrigin);
    return;
  }

  if (method === 'GET') {
    const state = await readState();
    writeJson(response, 200, state, requestOrigin);
    return;
  }

  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    writeJson(response, 405, { error: 'Method not allowed' }, requestOrigin);
    return;
  }

  if (!isAuthorized(request, url)) {
    writeJson(response, 401, { error: 'Unauthorized' }, requestOrigin);
    return;
  }

  try {
    const rawBody = await readBody(request);
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const currentState = await readState();

    const hasFeatured = isRecord(payload) && Object.hasOwn(payload, 'featuredOverrides');
    const hasRegistered = isRecord(payload) && Object.hasOwn(payload, 'registeredEntities');
    const hasBoosts = isRecord(payload) && Object.hasOwn(payload, 'boosts');
    const hasDeletedFeatured = isRecord(payload) && Object.hasOwn(payload, 'deletedFeaturedIds');
    const hasDeletedEntities = isRecord(payload) && Object.hasOwn(payload, 'deletedEntityIds');

    const incomingFeatured = hasFeatured
      ? sanitizeState({ featuredOverrides: payload.featuredOverrides }).featuredOverrides
      : [];
    const incomingRegistered = hasRegistered
      ? sanitizeState({ registeredEntities: payload.registeredEntities }).registeredEntities
      : [];
    const incomingBoosts = hasBoosts
      ? sanitizeState({ boosts: payload.boosts }).boosts
      : {};
    const incomingDeletedFeaturedIds = hasDeletedFeatured
      ? sanitizeIdList(payload.deletedFeaturedIds)
      : [];
    const incomingDeletedEntityIds = hasDeletedEntities
      ? sanitizeIdList(payload.deletedEntityIds)
      : [];

    const deletedEntityIds = Array.from(new Set([
      ...currentState.deletedEntityIds,
      ...incomingDeletedEntityIds,
    ]));
    const deletedEntityIdSet = new Set(deletedEntityIds);

    const mergedFeatured = hasFeatured
      ? mergeById(currentState.featuredOverrides, incomingFeatured)
      : currentState.featuredOverrides;
    const mergedRegistered = hasRegistered
      ? mergeById(currentState.registeredEntities, incomingRegistered)
      : currentState.registeredEntities;

    const deletedFeaturedIds = Array.from(new Set([
      ...currentState.deletedFeaturedIds,
      ...incomingDeletedFeaturedIds,
      ...mergedFeatured
        .filter((item) => deletedEntityIdSet.has(item.entityId))
        .map((item) => item.id),
    ]));
    const deletedFeaturedIdSet = new Set(deletedFeaturedIds);

    const nextFeatured = mergedFeatured.filter((item) => {
      return !deletedEntityIdSet.has(item.entityId) && !deletedFeaturedIdSet.has(item.id);
    });
    const nextRegistered = mergedRegistered.filter((entity) => !deletedEntityIdSet.has(entity.id));
    const validTargetIds = new Set([
      ...nextRegistered.map((entity) => entity.id),
      ...nextFeatured.map((item) => item.id),
    ]);
    const mergedBoosts = hasBoosts
      ? { ...currentState.boosts, ...incomingBoosts }
      : currentState.boosts;
    const nextBoosts = Object.fromEntries(
      Object.entries(mergedBoosts).filter(([targetId]) => {
        return !deletedEntityIdSet.has(targetId)
          && !deletedFeaturedIdSet.has(targetId)
          && validTargetIds.has(targetId);
      }),
    );

    const nextState = {
      featuredOverrides: nextFeatured,
      registeredEntities: nextRegistered,
      boosts: nextBoosts,
      deletedFeaturedIds,
      deletedEntityIds,
    };

    await writeState(nextState);
    broadcastSharedFeedUpdate();
    writeJson(response, 200, nextState, requestOrigin);
  } catch (error) {
    writeJson(response, 400, { error: error instanceof Error ? error.message : 'Invalid request' }, requestOrigin);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`TonDiscover shared feed listening on http://${HOST}:${PORT}/shared-feed`);
  console.log(`Shared feed events stream on http://${HOST}:${PORT}/shared-feed/events`);
  console.log(`Storage file: ${DATA_FILE}`);
  if (TOKEN) {
    console.log('Write auth: bearer token required');
  }
});

server.on('close', () => {
  clearInterval(sseHeartbeat);
});
