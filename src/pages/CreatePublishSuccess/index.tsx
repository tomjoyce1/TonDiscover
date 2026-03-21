import { Link, useSearchParams } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { buttonStyles } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { isSharedFeedEnabled } from '@/services/storage/shared-featured-feed.ts';

const CreatePublishSuccess = () => {
  const [searchParams] = useSearchParams();
  const { savedEntities } = useAppState();
  const entityId = searchParams.get('entityId');
  const entity = savedEntities.find((item) => item.id === entityId);

  return (
    <PageShell title="Publish Success">
      <Card padding="lg" className="text-center">
        <div className="w-20 h-20 rounded-full bg-tg-success/20 flex items-center justify-center mx-auto mb-5">
          <Rocket className="w-10 h-10 text-tg-success" />
        </div>
        <h2 className="text-xl font-bold text-tg-primary mb-2">Post published</h2>
        {entity && <p className="text-sm text-tg-muted mb-2">Published for: {entity.name}</p>}
        <p className="text-sm text-tg-muted mb-5">
          {isSharedFeedEnabled
            ? 'Featured content is synced to the shared feed. Other devices should see it after refresh or within ~10 seconds.'
            : 'Featured content was updated locally on this device. Configure a shared feed endpoint for cross-user visibility.'}
        </p>
        <div className="flex flex-col gap-2">
          {entity && (
            <Link
              to={`/create/post?entityId=${encodeURIComponent(entity.id)}`}
              className={buttonStyles({ variant: 'primary', size: 'lg', fullWidth: true })}
            >
              Create another post
            </Link>
          )}
          <Link to="/create" className={buttonStyles({ variant: 'secondary', size: 'lg', fullWidth: true })}>Back to Create Hub</Link>
          <Link to="/explore" className={buttonStyles({ variant: 'secondary', size: 'lg', fullWidth: true })}>Back to Explore</Link>
        </div>
      </Card>
    </PageShell>
  );
};

export default CreatePublishSuccess;
