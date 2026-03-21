type TelegramWebApp = {
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

const TELEGRAM_HOSTS = new Set([
  't.me',
  'telegram.me',
  'www.t.me',
  'www.telegram.me',
]);

const normalizeGameKey = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const HARDCODED_GAMEE_LINKS: Record<string, string> = {
  // Problematic GAMEE links: force direct game pages (no share flow).
  marsrover: 'https://prizes.gamee.com/game-bot/MarsRover',
  riosprint: 'https://prizes.gamee.com/game-bot/RioSprint',
};

const extractGameeGameName = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!TELEGRAM_HOSTS.has(parsed.hostname.toLowerCase())) {
      return null;
    }

    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    const segments = cleanPath.split('/').filter(Boolean);

    if (segments[0]?.toLowerCase() !== 'gamee') {
      return null;
    }

    const gameFromPath = segments[1] ? decodeURIComponent(segments[1]) : '';
    const gameFromQuery = parsed.searchParams.get('game')?.trim() ?? '';
    const startAppFromQuery = parsed.searchParams.get('startapp')?.trim() ?? '';
    const gameName = gameFromQuery || gameFromPath || startAppFromQuery;
    return gameName || null;
  } catch {
    return null;
  }
};

const resolveHardcodedGameeUrl = (url: string): string | null => {
  const gameName = extractGameeGameName(url);
  if (!gameName) {
    return null;
  }

  return HARDCODED_GAMEE_LINKS[normalizeGameKey(gameName)] ?? null;
};

const normalizeUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('tg://')) {
    return trimmed;
  }

  const hasScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed);
  if (hasScheme) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const isTelegramLink = (url: string): boolean => {
  if (url.startsWith('tg://')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return TELEGRAM_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
};

export const openTelegramAwareLink = (rawUrl: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const url = normalizeUrl(rawUrl);
  if (!url) {
    return;
  }
  // For known problematic GAMEE slugs, force a dedicated post link.
  // For all others, keep original behavior.
  const finalUrl = resolveHardcodedGameeUrl(url) ?? url;

  const webApp = (window as TelegramWindow).Telegram?.WebApp;
  if (webApp) {
    if (isTelegramLink(finalUrl)) {
      if (webApp.openTelegramLink) {
        webApp.openTelegramLink(finalUrl);
        return;
      }

      // Fallback for older Telegram clients without openTelegramLink support.
      window.location.href = finalUrl;
      return;
    }

    if (webApp.openLink) {
      webApp.openLink(finalUrl);
      return;
    }
  }

  const openedWindow = window.open(finalUrl, '_blank');
  if (!openedWindow) {
    window.location.href = finalUrl;
  }
};
