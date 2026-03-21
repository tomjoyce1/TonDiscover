import { Link, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { isSharedFeedEnabled } from '@/services/storage/shared-featured-feed.ts';

const CreatePublishSuccess = () => {
  const [searchParams] = useSearchParams();
  const { savedEntities } = useAppState();
  const entityId = searchParams.get('entityId');
  const entity = savedEntities.find((item) => item.id === entityId);

  return (
    <PageShell title="Publish Success">
      <section className="td-card td-stack">
        <h2>Post published</h2>
        {entity && <p className="td-muted">Published for: {entity.name}</p>}
        <p className="td-muted">
          {isSharedFeedEnabled
            ? 'Featured content is synced to the shared feed. Other devices should see it after refresh or within ~10 seconds.'
            : 'Featured content was updated locally on this device. Configure a shared feed endpoint for cross-user visibility.'}
        </p>
        {entity && (
          <Link to={`/create/post?entityId=${encodeURIComponent(entity.id)}`} className="td-link-button td-inline-link">
            Create another post
          </Link>
        )}
        <Link to="/create" className="td-link-button td-inline-link">Back to Create Hub</Link>
        <Link to="/explore" className="td-link-button td-inline-link">Back to Explore</Link>
      </section>
    </PageShell>
  );
};

export default CreatePublishSuccess;
