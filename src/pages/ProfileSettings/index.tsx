import { useEffect, useState } from 'react';
import { Bell, Minimize2, PlayCircle } from 'lucide-react';
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
      <section className="space-y-3">
        <button type="button" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border" onClick={() => toggle('notificationsEnabled')}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">Notifications</span>
          </div>
          <span className="text-sm text-tg-muted">{settings.notificationsEnabled ? 'On' : 'Off'}</span>
        </button>
        <button type="button" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border" onClick={() => toggle('autoplayVideo')}>
          <div className="flex items-center gap-3">
            <PlayCircle className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">Video autoplay</span>
          </div>
          <span className="text-sm text-tg-muted">{settings.autoplayVideo ? 'On' : 'Off'}</span>
        </button>
        <button type="button" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border" onClick={() => toggle('compactMode')}>
          <div className="flex items-center gap-3">
            <Minimize2 className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">Compact mode</span>
          </div>
          <span className="text-sm text-tg-muted">{settings.compactMode ? 'On' : 'Off'}</span>
        </button>
      </section>
    </PageShell>
  );
};

export default ProfileSettings;
