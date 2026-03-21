import type { FeaturedContent } from '@/types/tondiscover.ts';

type SharedFeedPayload = {
  featuredOverrides: FeaturedContent[];
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

const toOptionalString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() ? value : undefined;
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

const parseFeaturedOverrides = (payload: unknown): FeaturedContent[] => {
  const source: unknown[] = Array.isArray(payload)
    ? payload
    : (payload as Partial<SharedFeedPayload> | null)?.featuredOverrides ?? [];

  return source
    .map(sanitizeFeaturedContent)
    .filter((item): item is FeaturedContent => item !== null);
};

export const isSharedFeedEnabled = Boolean(readUrl && writeUrl);

export const readSharedFeaturedOverrides = async (): Promise<FeaturedContent[] | null> => {
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

    const payload = await response.json();
    return parseFeaturedOverrides(payload);
  } catch {
    return null;
  }
};

export const writeSharedFeaturedOverrides = async (featuredOverrides: FeaturedContent[]): Promise<boolean> => {
  if (!isSharedFeedEnabled) {
    return false;
  }

  const method = isAllowedWriteMethod(writeMethod) ? writeMethod : 'PUT';

  try {
    const response = await fetch(writeUrl, {
      method,
      headers: buildHeaders(true),
      body: JSON.stringify({ featuredOverrides }),
    });

    return response.ok;
  } catch {
    return false;
  }
};
