import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Minimize2, PlayCircle } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { cx } from '@/helpers/class-name.ts';

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
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<SettingsState>) };
  } catch {
    return defaultSettings;
  }
};

const settingItems: { key: keyof SettingsState; icon: typeof Bell; label: string; description: string; accent: string }[] = [
  { key: 'notificationsEnabled', icon: Bell,       label: 'Notifications',   description: 'Push alerts for new content',    accent: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  { key: 'autoplayVideo',        icon: PlayCircle, label: 'Video autoplay',  description: 'Auto-play videos in feed',       accent: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
  { key: 'compactMode',          icon: Minimize2,  label: 'Compact mode',    description: 'Denser layout with smaller cards', accent: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
];

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    className={cx(
      'relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-200',
      enabled ? 'bg-primary' : 'bg-muted-foreground/20',
    )}
  >
    <span
      className={cx(
        'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
        enabled ? 'translate-x-6' : 'translate-x-1',
      )}
    />
  </button>
);

const ProfileSettings = () => {
  const [settings, setSettings] = useState<SettingsState>(readSettings);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/profile"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">App preferences</p>
        </div>
      </header>

      <div className="px-4">
        <nav className="rounded-2xl border border-border bg-card overflow-hidden">
          {settingItems.map(({ key, icon: Icon, label, description, accent }, i) => (
            <div
              key={key}
              className={cx(
                'flex items-center gap-4 px-4 py-4',
                i < settingItems.length - 1 && 'border-b border-border/50',
              )}
            >
              <div className={cx('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border', accent)}>
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[12px] text-muted-foreground mt-1">{description}</p>
              </div>
              <Toggle enabled={settings[key]} onToggle={() => toggle(key)} />
            </div>
          ))}
        </nav>
      </div>

      <BottomNav />
    </main>
  );
};

export default ProfileSettings;
