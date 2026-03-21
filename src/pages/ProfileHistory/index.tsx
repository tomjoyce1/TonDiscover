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
      <section className="td-card td-stack">
        <h2>Recent Opens</h2>
        {openedEntities.length === 0 && <p className="td-muted">No recently opened entities.</p>}
        {openedEntities.map((entity) => (
          <Link key={entity.id} to={`/entity/${entity.id}`} className="td-list-link">
            {entity.name}
          </Link>
        ))}
      </section>
      <section className="td-card td-stack">
        <h2>Recent Launches</h2>
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

export default ProfileHistory;
