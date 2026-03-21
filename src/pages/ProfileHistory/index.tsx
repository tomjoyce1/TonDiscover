import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';
import type { Entity } from '@/types/tondiscover.ts';

const ProfileHistory = () => {
  const { entities, history } = useAppState();
  const openedEntities = history.recentOpenedEntityIds
    .map((id) => entities.find((entity) => entity.id === id))
    .filter((entity): entity is Entity => entity !== undefined);
  const launchedApps = history.recentLaunchedAppIds
    .map((id) => entities.find((entity) => entity.id === id))
    .filter((entity): entity is Entity => entity !== undefined);

  return (
    <PageShell title="History" backTo="/profile">
      <section className="bg-tg-card border border-tg-border rounded-2xl p-4">
        <h2 className="text-base font-semibold text-tg-primary mb-3">Recent Opens</h2>
        {openedEntities.length === 0 && <p className="text-sm text-tg-muted">No recently opened entities.</p>}
        <div className="space-y-2">
          {openedEntities.map((entity) => (
            <Link key={entity.id} to={`/entity/${entity.id}`} className="w-full bg-tg-input rounded-xl p-3 text-sm text-tg-primary block">
              {entity.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-tg-card border border-tg-border rounded-2xl p-4">
        <h2 className="text-base font-semibold text-tg-primary mb-3">Recent Launches</h2>
        {launchedApps.length === 0 && <p className="text-sm text-tg-muted">No launches yet.</p>}
        <div className="space-y-2">
          {launchedApps.map((entity) => (
            <Link key={entity.id} to={`/entity/${entity.id}`} className="w-full bg-tg-input rounded-xl p-3 text-sm text-tg-primary block">
              {entity.name}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default ProfileHistory;
