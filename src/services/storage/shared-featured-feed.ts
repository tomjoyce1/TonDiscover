import type { Entity, FeaturedContent } from '@/types/tondiscover.ts';

type SharedFeedPayload = {
  featuredOverrides?: unknown;
  registeredEntities?: unknown;
};

export type SharedFeedSnapshot = {
  featuredOverrides: FeaturedContent[];
  registeredEntities: Entity[];
};

const mergeFeaturedOverrides = (preferred: FeaturedContent[], fallback: FeaturedContent[]): FeaturedContent[] => {
  const byEntity = new Map<string, FeaturedContent>();
  fallback.forEach((item) => {
    byEntity.set(item.entityId, item);
  });
  preferred.forEach((item) => {
    byEntity.set(item.entityId, item);
  });
  return Array.from(byEntity.values());
};

const mergeRegisteredEntities = (preferred: Entity[], fallback: Entity[]): Entity[] => {
  const byId = new Map<string, Entity>();
  fallback.forEach((entity) => {
    byId.set(entity.id, entity);
  });
  preferred.forEach((entity) => {
    byId.set(entity.id, entity);
  });
  return Array.from(byId.values());
};

const trim = (value: string | undefined): string => (value ?? '').trim();

const sharedFeedUrl = trim(import.meta.env.VITE_SHARED_FEED_URL);
const readUrl = trim(import.meta.env.VITE_SHARED_FEED_READ_URL) || sharedFeedUrl;
const writeUrl = trim(import.meta.env.VITE_SHARED_FEED_WRITE_URL) || sharedFeedUrl;
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

export const readSharedFeedSnapshot = async (): Promise<SharedFeedSnapshot | null> => {
  const payload = await readSharedPayload();
  if (!payload) {
    return null;
  }

  return {
    featuredOverrides: parseFeaturedOverrides(payload),
    registeredEntities: parseRegisteredEntities(payload),
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
): Promise<boolean> => {
  if (!isSharedFeedEnabled) {
    return false;
  }

  const method = isAllowedWriteMethod(writeMethod) ? writeMethod : 'PUT';
  let nextFeaturedOverrides = featuredOverrides;
  let nextRegisteredEntities = registeredEntities;

  const remotePayload = await readSharedPayload();
  if (remotePayload) {
    nextFeaturedOverrides = mergeFeaturedOverrides(featuredOverrides, parseFeaturedOverrides(remotePayload));
    nextRegisteredEntities = mergeRegisteredEntities(registeredEntities, parseRegisteredEntities(remotePayload));
  }

  try {
    const response = await fetch(writeUrl, {
      method,
      headers: buildHeaders(true),
      body: JSON.stringify({
        featuredOverrides: nextFeaturedOverrides,
        registeredEntities: nextRegisteredEntities,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};
