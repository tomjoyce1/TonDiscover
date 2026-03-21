import { Link } from 'react-router-dom';
import { Heart, Clock, Settings, User, Wallet, Sliders, ChevronRight, Sparkles } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';

const ACCOUNT_KEY = 'tondiscover:profile-account';
const readAccount = () => {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return { displayName: 'TON User', bio: '' };
    return { displayName: 'TON User', bio: '', ...(JSON.parse(raw) as Record<string, string>) };
  } catch {
    return { displayName: 'TON User', bio: '' };
  }
};

const menuSections = [
  {
    title: 'Activity',
    items: [
      { icon: Heart, label: 'Favorites', to: '/profile/favorites', description: 'Saved channels & apps', accent: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
      { icon: Clock, label: 'History', to: '/profile/history', description: 'Recently viewed', accent: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: Wallet, label: 'Wallet', to: '/profile/wallet', description: 'TON wallet & balance', accent: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
      { icon: User, label: 'Identity', to: '/profile/account', description: 'Profile & security', accent: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Sliders, label: 'Feed', to: '/profile/preferences', description: 'Feed & notifications', accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
      { icon: Settings, label: 'Settings', to: '/profile/settings', description: 'App preferences', accent: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
    ],
  },
];

const Profile = () => {
  const { favorites, ownedEntities } = useAppState();
  const account = readAccount();

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="px-5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          <span className="text-primary">My</span> Profile
        </h1>
      </header>

      {/* Avatar & name card */}
      <section className="mx-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-[2.5px] border-card" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground leading-tight truncate">{account.displayName}</h2>
            {account.bio && (
              <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{account.bio}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Hackathon mode
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted/60 py-4 border border-border/50">
            <span className="text-2xl font-bold text-foreground">{ownedEntities.length}</span>
            <span className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">Posts</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted/60 py-4 border border-border/50">
            <span className="text-2xl font-bold text-foreground">{favorites.favoriteAppIds.length}</span>
            <span className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">Favorites</span>
          </div>
        </div>
      </section>

      {/* Menu sections */}
      <div className="mt-6 px-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
              {section.title}
            </h3>
            <nav className="overflow-hidden rounded-2xl border border-border bg-card" aria-label={section.title}>
              {section.items.map(({ icon: Icon, label, to, description, accent }, i) => (
                <Link
                  key={label}
                  to={to}
                  className={cx(
                    'group flex items-center gap-4 px-4 py-4 transition-colors active:bg-muted/50',
                    i < section.items.length - 1 && 'border-b border-border/50',
                  )}
                >
                  <div className={cx('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border', accent)}>
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
};

export default Profile;
