import type { BoostState, Entity, FeaturedContent } from '@/types/tondiscover.ts';

type SharedFeedPayload = {
  featuredOverrides?: unknown;
  registeredEntities?: unknown;
  boosts?: unknown;
  deletedFeaturedIds?: unknown;
  deletedEntityIds?: unknown;
};

export type SharedFeedSnapshot = {
  featuredOverrides: FeaturedContent[];
  registeredEntities: Entity[];
  boosts: Record<string, BoostState>;
  deletedFeaturedIds: string[];
  deletedEntityIds: string[];
};

const trim = (value: string | undefined): string => (value ?? '').trim();

const sharedFeedUrl = trim(import.meta.env.VITE_SHARED_FEED_URL);
const readUrl = trim(import.meta.env.VITE_SHARED_FEED_READ_URL) || sharedFeedUrl;
const writeUrl = trim(import.meta.env.VITE_SHARED_FEED_WRITE_URL) || sharedFeedUrl;
const defaultEventsUrl = readUrl ? `${readUrl.replace(/\/$/, '')}/events` : '';
const eventsUrl = trim(import.meta.env.VITE_SHARED_FEED_EVENTS_URL) || defaultEventsUrl;
const rawWriteMethod = trim(import.meta.env.VITE_SHARED_FEED_WRITE_METHOD).toUpperCase();
const writeMethod = rawWriteMethod || 'PUT';
const token = trim(import.meta.env.VITE_SHARED_FEED_TOKEN);

const isAllowedWriteMethod = (method: string): boolean => ['POST', 'PUT', 'PATCH'].includes(method);

const buildHeaders = (includeContentType: boolean): HeadersInit => {
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const isMode = (value: unknown): value is FeaturedContent['mode'] => {
  return value === 'latest'
    || value === 'pinned'
    || value === 'specific'
    || value === 'manual';
};

const isContentType = (value: unknown): value is FeaturedContent['contentType'] => {
  return value === 'text' || value === 'image' || value === 'video';
};

const isEntityType = (value: unknown): value is Entity['type'] => {
  return value === 'channel' || value === 'app';
};

const isBoostStatus = (value: unknown): value is BoostState['status'] => {
  return value === 'inactive' || value === 'pending' || value === 'active' || value === 'failed';
};

const isBoostSource = (value: unknown): value is BoostState['source'] => {
  return value === 'mock' || value === 'ton';
};

const toOptionalString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() ? value : undefined;
};

const toNumber = (value: unknown, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const sanitizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const sanitizeIdList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const sanitizeFeaturedContent = (value: unknown): FeaturedContent | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<FeaturedContent>;
  if (
    typeof candidate.id !== 'string'
    || typeof candidate.entityId !== 'string'
    || !isMode(candidate.mode)
    || !isContentType(candidate.contentType)
  ) {
    return null;
  }

  return {
    id: candidate.id,
    entityId: candidate.entityId,
    mode: candidate.mode,
    contentType: candidate.contentType,
    title: toOptionalString(candidate.title),
    text: toOptionalString(candidate.text),
    mediaUrl: toOptionalString(candidate.mediaUrl),
  };
};

const sanitizeEntity = (value: unknown): Entity | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<Entity>;
  if (
    typeof candidate.id !== 'string'
    || !isEntityType(candidate.type)
    || typeof candidate.name !== 'string'
    || typeof candidate.category !== 'string'
    || typeof candidate.shortDescription !== 'string'
    || typeof candidate.telegramUrl !== 'string'
    || !isContentType(candidate.contentType)
  ) {
    return null;
  }

  return {
    id: candidate.id,
    type: candidate.type,
    name: candidate.name,
    category: candidate.category,
    tags: sanitizeTags(candidate.tags),
    shortDescription: candidate.shortDescription,
    longDescription: toOptionalString(candidate.longDescription),
    telegramUrl: candidate.telegramUrl,
    contentType: candidate.contentType,
    previewText: toOptionalString(candidate.previewText),
    previewMediaUrl: toOptionalString(candidate.previewMediaUrl),
    editorialScore: toNumber(candidate.editorialScore, 55),
    activityScore: toNumber(candidate.activityScore, 30),
    engagementScore: toNumber(candidate.engagementScore, 25),
  };
};

const sanitizeBoostState = (entityId: string, value: unknown): BoostState | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<BoostState>;
  if (!isBoostStatus(candidate.status)) {
    return null;
  }

  return {
    entityId: candidate.entityId && typeof candidate.entityId === 'string'
      ? candidate.entityId
      : entityId,
    status: candidate.status,
    startedAt: toOptionalString(candidate.startedAt),
    expiresAt: toOptionalString(candidate.expiresAt),
    source: isBoostSource(candidate.source) ? candidate.source : 'mock',
  };
};

const parseFeaturedOverrides = (payload: unknown): FeaturedContent[] => {
  const source: unknown[] = Array.isArray(payload)
    ? payload
    : (payload as SharedFeedPayload | null)?.featuredOverrides as unknown[] ?? [];

  return source
    .map(sanitizeFeaturedContent)
    .filter((item): item is FeaturedContent => item !== null);
};

const parseRegisteredEntities = (payload: unknown): Entity[] => {
  const source: unknown[] = (payload as SharedFeedPayload | null)?.registeredEntities as unknown[] ?? [];

  return source
    .map(sanitizeEntity)
    .filter((entity): entity is Entity => entity !== null);
};

const parseBoosts = (payload: unknown): Record<string, BoostState> => {
  const source = (payload as SharedFeedPayload | null)?.boosts;
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return {};
  }

  const entries = Object.entries(source as Record<string, unknown>)
    .map(([entityId, value]) => [entityId, sanitizeBoostState(entityId, value)] as const)
    .filter((entry): entry is [string, BoostState] => entry[1] !== null);

  return Object.fromEntries(entries);
};

const parseDeletedFeaturedIds = (payload: unknown): string[] => {
  return sanitizeIdList((payload as SharedFeedPayload | null)?.deletedFeaturedIds);
};

const parseDeletedEntityIds = (payload: unknown): string[] => {
  return sanitizeIdList((payload as SharedFeedPayload | null)?.deletedEntityIds);
};

const readSharedPayload = async (): Promise<unknown | null> => {
  if (!isSharedFeedEnabled) {
    return null;
  }

  try {
    const response = await fetch(readUrl, {
      method: 'GET',
      headers: buildHeaders(false),
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
};

export const isSharedFeedEnabled = Boolean(readUrl && writeUrl);

export const subscribeSharedFeedUpdates = (onUpdate: () => void): (() => void) | null => {
  if (!eventsUrl || typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
    return null;
  }

  const eventUrl = token
    ? `${eventsUrl}${eventsUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
    : eventsUrl;
  const stream = new EventSource(eventUrl);

  const handleMessage = () => {
    onUpdate();
  };

  stream.addEventListener('shared-feed-updated', handleMessage);
  stream.addEventListener('message', handleMessage);

  return () => {
    stream.removeEventListener('shared-feed-updated', handleMessage);
    stream.removeEventListener('message', handleMessage);
    stream.close();
  };
};

export const readSharedFeedSnapshot = async (): Promise<SharedFeedSnapshot | null> => {
  const payload = await readSharedPayload();
  if (!payload) {
    return null;
  }

  return {
    featuredOverrides: parseFeaturedOverrides(payload),
    registeredEntities: parseRegisteredEntities(payload),
    boosts: parseBoosts(payload),
    deletedFeaturedIds: parseDeletedFeaturedIds(payload),
    deletedEntityIds: parseDeletedEntityIds(payload),
  };
};

export const readSharedFeaturedOverrides = async (): Promise<FeaturedContent[] | null> => {
  const snapshot = await readSharedFeedSnapshot();
  if (!snapshot) {
    return null;
  }
  return snapshot.featuredOverrides;
};

export const readSharedRegisteredEntities = async (): Promise<Entity[] | null> => {
  const snapshot = await readSharedFeedSnapshot();
  if (!snapshot) {
    return null;
  }
  return snapshot.registeredEntities;
};

export const writeSharedFeaturedOverrides = async (
  featuredOverrides: FeaturedContent[],
  registeredEntities: Entity[] = [],
  boosts?: Record<string, BoostState>,
  deletedFeaturedIds: string[] = [],
  deletedEntityIds: string[] = [],
): Promise<boolean> => {
  if (!isSharedFeedEnabled) {
    return false;
  }

  const method = isAllowedWriteMethod(writeMethod) ? writeMethod : 'PUT';

  try {
    const response = await fetch(writeUrl, {
      method,
      headers: buildHeaders(true),
      body: JSON.stringify({
        featuredOverrides,
        registeredEntities,
        boosts,
        deletedFeaturedIds,
        deletedEntityIds,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};

export const writeSharedBoostStates = async (boosts: Record<string, BoostState>): Promise<boolean> => {
  if (!isSharedFeedEnabled) {
    return false;
  }

  const method = isAllowedWriteMethod(writeMethod) ? writeMethod : 'PUT';

  try {
    const response = await fetch(writeUrl, {
      method,
      headers: buildHeaders(true),
      body: JSON.stringify({
        boosts,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};
