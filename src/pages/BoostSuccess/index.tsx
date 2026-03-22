import { Link, useSearchParams } from 'react-router-dom';
import { Rocket, Sparkles } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { buttonStyles } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { useAppState } from '@/context/app-context.tsx';

const BoostSuccess = () => {
  const [searchParams] = useSearchParams();
  const { entities, featuredContent } = useAppState();

  const targetId = searchParams.get('targetId') ?? searchParams.get('entityId');
  const requestedTargetType = searchParams.get('targetType');
  const targetPost = targetId ? featuredContent.find((post) => post.id === targetId) : undefined;
  const targetType = requestedTargetType === 'post'
    || (requestedTargetType !== 'entity' && Boolean(targetPost))
    ? 'post'
    : 'entity';

  const targetEntityId = targetType === 'post'
    ? targetPost?.entityId
    : targetId ?? undefined;
  const targetEntity = targetEntityId ? entities.find((entity) => entity.id === targetEntityId) : undefined;
  const source = searchParams.get('source') === 'ton' ? 'ton' : 'mock';
  const targetName = targetType === 'post'
    ? (targetPost?.title?.trim() || `${targetEntity?.name ?? 'Unknown'} post`)
    : (targetEntity?.name ?? 'Unknown');

  return (
    <PageShell
      title="Boost Activated"
      subtitle={targetType === 'post' ? 'Your post is now boosted.' : 'Your entity is now boosted.'}
      backTo="/create/boost"
    >
      <Card variant="success" padding="lg" className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-tg-success/20">
          <Rocket className="h-10 w-10 text-tg-success" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-tg-primary">Boost live</h2>
        <p className="text-sm text-tg-muted">
          {targetName}
        </p>
        <p className="mt-1 text-xs text-tg-muted">
          Source: {source === 'ton' ? 'TON payment' : 'Mock fallback'}
        </p>
      </Card>

      <Card variant="boost" className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-tg-boost" />
          <p className="text-sm font-semibold text-tg-primary">What changed</p>
        </div>
        <p className="text-sm text-tg-muted">
          The boosted label and ranking are now prioritized in Discovery and Search.
        </p>
      </Card>

      <div className="space-y-2">
        {targetEntity && (
          <Link
            to={targetType === 'post' && targetPost
              ? `/explore?entityId=${encodeURIComponent(targetEntity.id)}&postId=${encodeURIComponent(targetPost.id)}`
              : `/explore?entityId=${encodeURIComponent(targetEntity.id)}`}
            className={buttonStyles({ variant: 'boost', size: 'lg', fullWidth: true })}
          >
            {targetType === 'post' ? 'View Boosted Post' : 'View Boosted Entity'}
          </Link>
        )}
        <Link to="/explore" className={buttonStyles({ variant: 'secondary', size: 'lg', fullWidth: true })}>
          Back to Discover
        </Link>
        <Link to="/create/boost" className={buttonStyles({ variant: 'secondary', size: 'lg', fullWidth: true })}>
          Boost Another
        </Link>
      </div>
    </PageShell>
  );
};

export default BoostSuccess;
