import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const Favorites = () => {
  const { entities, favorites } = useAppState();

  const favoriteApps = entities.filter((entity) => {
    return entity.type === 'app' && favorites.favoriteAppIds.includes(entity.id);
  });

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
    </PageShell>
  );
};

export default Favorites;
