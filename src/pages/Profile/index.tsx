import { Link } from 'react-router-dom';
import { Heart, Clock, Settings, User, Wallet, Sliders, ChevronRight } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';

const menuItems = [
  { icon: Heart, label: 'Favorites', to: '/profile/favorites', description: 'Saved channels & apps' },
  { icon: Clock, label: 'History', to: '/profile/history', description: 'Recently viewed' },
  { icon: Settings, label: 'Settings', to: '/profile/settings', description: 'App preferences' },
  { icon: User, label: 'Account', to: '/profile/account', description: 'Identity & security' },
  { icon: Wallet, label: 'Wallet', to: '/profile/wallet', description: 'TON wallet & balance' },
  { icon: Sliders, label: 'Preferences', to: '/profile/preferences', description: 'Feed & notifications' },
];

const Profile = () => {
  const { favorites, history } = useAppState();

  return (
    <main className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 safe-area-top">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage account, favorites, wallet, and preferences.</p>
      </header>

      {/* Avatar & name card */}
      <section className="mx-4 mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-card" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">TON User</h2>
            <span className="inline-flex items-center gap-1 mt-0.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
              Hackathon mode
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted py-3">
            <span className="text-2xl font-bold text-foreground">{favorites.favoriteAppIds.length}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Favorites</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted py-3">
            <span className="text-2xl font-bold text-foreground">{history.recentLaunchedAppIds.length}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Launches</span>
          </div>
        </div>
      </section>

      {/* Menu */}
      <nav className="mx-4 mt-4 overflow-hidden rounded-2xl border border-border bg-card" aria-label="Profile menu">
        {menuItems.map(({ icon: Icon, label, to, description }, i) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-4 px-4 py-3.5 transition-colors active:bg-muted/50"
            style={i < menuItems.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </Link>
        ))}
      </nav>

      <BottomNav />
    </main>
  );
};

export default Profile;
