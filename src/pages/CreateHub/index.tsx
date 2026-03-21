import { Link, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const CreateHub = () => {
  const [searchParams] = useSearchParams();
  const { savedEntities } = useAppState();
  const hasSavedEntities = savedEntities.length > 0;
  const defaultOverviewEntityId = savedEntities[0]?.id ?? '';
  const savedEntityId = searchParams.get('saved');
  const savedEntity = savedEntities.find((entity) => entity.id === savedEntityId);

  return (
    <PageShell title="Create">
      <section className="td-card td-stack">
        <h2>Create Hub</h2>
        <p className="td-muted">Simple flow: add channel/app, then create and publish a post.</p>
        {savedEntity && (
          <p className="td-muted">
            Saved: <strong>{savedEntity.name}</strong>. You can now create a post for it.
          </p>
        )}
        <Link to="/create/register" className="td-list-link">1. Add Channel / App</Link>
        {hasSavedEntities ? (
          <Link to={`/create/overview/${encodeURIComponent(defaultOverviewEntityId)}`} className="td-list-link">
            2. Channels Overview
          </Link>
        ) : (
          <p className="td-list-link td-list-link-disabled">2. Channels Overview (add a channel/app first)</p>
        )}
        {hasSavedEntities ? (
          <Link to="/create/post" className="td-list-link">3. Create Post</Link>
        ) : (
          <p className="td-list-link td-list-link-disabled">3. Create Post (add a channel/app first)</p>
        )}
        <Link to="/create/boost" className="td-list-link">4. Boost</Link>
      </section>

      <section className="td-card td-stack">
        <h2>Your Channels / Apps</h2>
        {savedEntities.length === 0 ? (
          <p className="td-muted">No saved channels/apps yet.</p>
        ) : (
          savedEntities.map((entity) => (
            <Link
              key={entity.id}
              to={`/create/overview/${encodeURIComponent(entity.id)}`}
              className="td-list-link"
            >
              Open {entity.name} ({entity.type})
            </Link>
          ))
        )}
      </section>
    </PageShell>
  );
};

export default CreateHub;
