import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const Profile = () => {
  const { favorites, history } = useAppState();

  return (
    <PageShell title="Profile" subtitle="General description and personal sections.">
      <section className="td-card td-stack">
        <p className="td-muted">Manage favorites, history, wallet, and preferences from one place.</p>
        <p className="td-muted">Favorites: {favorites.favoriteAppIds.length}</p>
        <p className="td-muted">Recent launches: {history.recentLaunchedAppIds.length}</p>
        <Link to="/profile/favorites" className="td-list-link">Favorites</Link>
        <Link to="/profile/history" className="td-list-link">History</Link>
        <Link to="/profile/settings" className="td-list-link">Settings</Link>
        <Link to="/profile/account" className="td-list-link">Account</Link>
        <Link to="/profile/wallet" className="td-list-link">Wallet</Link>
        <Link to="/profile/preferences" className="td-list-link">Preferences</Link>
      </section>
    </PageShell>
  );
};

export default Profile;
