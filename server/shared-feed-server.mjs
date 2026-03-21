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
};

const allowedContentTypes = new Set(['text', 'image', 'video']);
const allowedModes = new Set(['latest', 'pinned', 'specific', 'manual']);
const allowedEntityTypes = new Set(['channel', 'app']);

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

  return {
    featuredOverrides,
    registeredEntities,
  };
};

const mergeBy = (preferred, fallback, key) => {
  const byKey = new Map();
  fallback.forEach((item) => {
    byKey.set(item[key], item);
  });
  preferred.forEach((item) => {
    byKey.set(item[key], item);
  });
  return Array.from(byKey.values());
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

const isAuthorized = (request) => {
  if (!TOKEN) {
    return true;
  }
  const header = request.headers.authorization || '';
  return header === `Bearer ${TOKEN}`;
};

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

  if (!isAuthorized(request)) {
    writeJson(response, 401, { error: 'Unauthorized' }, requestOrigin);
    return;
  }

  try {
    const rawBody = await readBody(request);
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const currentState = await readState();

    const hasFeatured = isRecord(payload) && Object.hasOwn(payload, 'featuredOverrides');
    const hasRegistered = isRecord(payload) && Object.hasOwn(payload, 'registeredEntities');

    const incomingFeatured = hasFeatured
      ? sanitizeState({ featuredOverrides: payload.featuredOverrides }).featuredOverrides
      : [];
    const incomingRegistered = hasRegistered
      ? sanitizeState({ registeredEntities: payload.registeredEntities }).registeredEntities
      : [];

    const nextState = {
      featuredOverrides: hasFeatured
        ? mergeBy(incomingFeatured, currentState.featuredOverrides, 'entityId')
        : currentState.featuredOverrides,
      registeredEntities: hasRegistered
        ? mergeBy(incomingRegistered, currentState.registeredEntities, 'id')
        : currentState.registeredEntities,
    };

    await writeState(nextState);
    writeJson(response, 200, nextState, requestOrigin);
  } catch (error) {
    writeJson(response, 400, { error: error instanceof Error ? error.message : 'Invalid request' }, requestOrigin);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`TonDiscover shared feed listening on http://${HOST}:${PORT}/shared-feed`);
  console.log(`Storage file: ${DATA_FILE}`);
  if (TOKEN) {
    console.log('Write auth: bearer token required');
  }
});
