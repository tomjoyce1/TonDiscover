import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const Favorites = () => {
  const { entities, favorites } = useAppState();

  const favoriteApps = entities.filter((entity) => {
    return entity.type === 'app' && favorites.favoriteAppIds.includes(entity.id);
  });

  return (
    <PageShell title="Favorites" backTo="/profile">
      <section className="bg-tg-card border border-tg-border rounded-2xl p-4">
        <h2 className="text-base font-semibold text-tg-primary mb-3">Favorite Apps</h2>
        {favoriteApps.length === 0 && <p className="text-sm text-tg-muted">No favorites yet.</p>}
        <div className="space-y-2">
          {favoriteApps.map((entity) => (
            <Link key={entity.id} to={`/entity/${entity.id}`} className="w-full bg-tg-input rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-tg-primary">{entity.name}</span>
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default Favorites;
