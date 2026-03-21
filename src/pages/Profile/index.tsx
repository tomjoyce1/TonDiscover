import { Link } from 'react-router-dom';
import { Clock, Heart, Settings, UserRound, Wallet } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const Profile = () => {
  const { favorites, history } = useAppState();

  return (
    <PageShell title="Profile" subtitle="Manage account, favorites, wallet, and preferences.">
      <section className="bg-tg-card rounded-2xl p-4 border border-tg-border">
        <div className="text-center mb-5">
          <div className="w-20 h-20 rounded-full bg-tg-accent/20 flex items-center justify-center mx-auto mb-3">
            <UserRound className="w-10 h-10 text-tg-accent" />
          </div>
          <h2 className="text-lg font-bold text-tg-primary">TON User</h2>
          <p className="text-xs text-tg-muted">Hackathon mode</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-tg-input rounded-2xl p-3 text-center">
            <p className="text-xl font-semibold text-tg-primary">{favorites.favoriteAppIds.length}</p>
            <p className="text-xs text-tg-muted mt-1">Favorites</p>
          </div>
          <div className="bg-tg-input rounded-2xl p-3 text-center">
            <p className="text-xl font-semibold text-tg-primary">{history.recentLaunchedAppIds.length}</p>
            <p className="text-xs text-tg-muted mt-1">Launches</p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <Link to="/profile/favorites" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">Favorites</span>
          </div>
          <span className="text-xs text-tg-muted">Open</span>
        </Link>
        <Link to="/profile/history" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">History</span>
          </div>
          <span className="text-xs text-tg-muted">Open</span>
        </Link>
        <Link to="/profile/settings" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">Settings</span>
          </div>
          <span className="text-xs text-tg-muted">Open</span>
        </Link>
        <Link to="/profile/account" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border">
          <div className="flex items-center gap-3">
            <UserRound className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">Account</span>
          </div>
          <span className="text-xs text-tg-muted">Open</span>
        </Link>
        <Link to="/profile/wallet" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">Wallet</span>
          </div>
          <span className="text-xs text-tg-muted">Open</span>
        </Link>
        <Link to="/profile/preferences" className="w-full bg-tg-card rounded-2xl p-4 flex items-center justify-between border border-tg-border">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-tg-muted" />
            <span className="text-sm text-tg-primary">Preferences</span>
          </div>
          <span className="text-xs text-tg-muted">Open</span>
        </Link>
      </section>
    </PageShell>
  );
};

export default Profile;
