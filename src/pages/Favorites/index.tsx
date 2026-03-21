import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';
import type { Entity } from '@/types/tondiscover.ts';

const Favorites = () => {
  const { entities, favorites, history } = useAppState();

  const favoriteApps = entities.filter((entity) => {
    return entity.type === 'app' && favorites.favoriteAppIds.includes(entity.id);
  });

  const launchedApps: Entity[] = history.recentLaunchedAppIds
    .map((id) => entities.find((entity) => entity.id === id))
    .filter((entity): entity is Entity => entity !== undefined);

  return (
    <PageShell title="Favorites" backTo="/profile">
        <section className="td-card">
          <h2>Favorite Apps</h2>
          {favoriteApps.length === 0 && <p className="td-muted">No favorites yet.</p>}
          {favoriteApps.map((entity) => (
            <Link key={entity.id} to={`/entity/${entity.id}`} className="td-list-link">
              {entity.name}
            </Link>
          ))}
        </section>
        <section className="td-card">
          <h2>Recent Launches (quick view)</h2>
          {launchedApps.length === 0 && <p className="td-muted">No launches yet.</p>}
          {launchedApps.map((entity) => (
            <Link key={entity.id} to={`/entity/${entity.id}`} className="td-list-link">
              {entity.name}
            </Link>
          ))}
        </section>
    </PageShell>
  );
};

export default Favorites;
