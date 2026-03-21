const hasWindow = () => typeof window !== 'undefined';

export const STORAGE_KEYS = {
  prefs: 'tondiscover:prefs',
  favorites: 'tondiscover:favorites',
  history: 'tondiscover:history',
  boosts: 'tondiscover:boosts',
  registeredEntities: 'tondiscover:registeredEntities',
  featuredOverrides: 'tondiscover:featuredOverrides',
} as const;

export const readJSON = <T>(key: string, fallbackValue: T): T => {
  if (!hasWindow()) {
    return fallbackValue;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallbackValue;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallbackValue;
  }
};

export const writeJSON = <T>(key: string, value: T): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};
