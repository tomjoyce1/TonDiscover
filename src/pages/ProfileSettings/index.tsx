import { useEffect, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell.tsx';

type SettingsState = {
  notificationsEnabled: boolean;
  autoplayVideo: boolean;
  compactMode: boolean;
};

const STORAGE_KEY = 'tondiscover:profile-settings';

const defaultSettings: SettingsState = {
  notificationsEnabled: true,
  autoplayVideo: false,
  compactMode: false,
};

const readSettings = (): SettingsState => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<SettingsState>) };
  } catch {
    return defaultSettings;
  }
};

const ProfileSettings = () => {
  const [settings, setSettings] = useState<SettingsState>(readSettings);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof SettingsState) => {
    setSettings((previousState) => ({
      ...previousState,
      [key]: !previousState[key],
    }));
  };

  return (
    <PageShell title="Settings" backTo="/profile">
      <section className="td-card td-stack">
        <button type="button" className="td-list-link td-list-button" onClick={() => toggle('notificationsEnabled')}>
          Notifications: {settings.notificationsEnabled ? 'On' : 'Off'}
        </button>
        <button type="button" className="td-list-link td-list-button" onClick={() => toggle('autoplayVideo')}>
          Video autoplay: {settings.autoplayVideo ? 'On' : 'Off'}
        </button>
        <button type="button" className="td-list-link td-list-button" onClick={() => toggle('compactMode')}>
          Compact mode: {settings.compactMode ? 'On' : 'Off'}
        </button>
      </section>
    </PageShell>
  );
};

export default ProfileSettings;
