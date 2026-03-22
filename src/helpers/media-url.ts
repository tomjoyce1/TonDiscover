const DIRECT_VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|m4v|mov)(?:$|[?#])/i;

const PAGE_VIDEO_HOSTS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'tiktok.com',
  'instagram.com',
  'facebook.com',
  'x.com',
  'twitter.com',
  't.me',
];

const hostMatches = (host: string, target: string): boolean => {
  return host === target || host.endsWith(`.${target}`);
};

const isPageVideoHost = (host: string): boolean => {
  return PAGE_VIDEO_HOSTS.some((target) => hostMatches(host, target));
};

const normalizeGoogleDriveUrl = (url: URL): string | null => {
  const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/i);
  if (fileMatch?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }

  const fileId = url.searchParams.get('id');
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return null;
};

const normalizeDropboxUrl = (url: URL): string => {
  const clone = new URL(url.toString());
  clone.hostname = 'dl.dropboxusercontent.com';
  clone.searchParams.delete('dl');
  clone.searchParams.set('raw', '1');
  return clone.toString();
};

const normalizeGithubBlobUrl = (url: URL): string | null => {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 5 || parts[2] !== 'blob') {
    return null;
  }

  const owner = parts[0];
  const repo = parts[1];
  const branch = parts[3];
  const filePath = parts.slice(4).join('/');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
};

export const normalizeMediaUrl = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (hostMatches(host, 'drive.google.com')) {
      return normalizeGoogleDriveUrl(parsed) ?? parsed.toString();
    }

    if (hostMatches(host, 'dropbox.com')) {
      return normalizeDropboxUrl(parsed);
    }

    if (host === 'github.com') {
      return normalizeGithubBlobUrl(parsed) ?? parsed.toString();
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
};

export const isRenderableMediaUrl = (value?: string): boolean => {
  const normalized = normalizeMediaUrl(value);
  if (!normalized) {
    return false;
  }

  // Keep supporting app-local/public assets.
  if (normalized.startsWith('/')) {
    return true;
  }

  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export type VideoLinkStatus = 'empty' | 'direct' | 'page' | 'unknown';

export const getVideoLinkStatus = (value?: string): VideoLinkStatus => {
  const normalized = normalizeMediaUrl(value);
  if (!normalized) {
    return 'empty';
  }

  if (DIRECT_VIDEO_EXT_RE.test(normalized)) {
    return 'direct';
  }

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();
    if (isPageVideoHost(host)) {
      return 'page';
    }

    // Google Drive direct export URLs can be playable if sharing/CORS allows it.
    if (hostMatches(host, 'drive.google.com') && parsed.pathname === '/uc') {
      return 'direct';
    }
  } catch {
    return 'unknown';
  }

  return 'unknown';
};
