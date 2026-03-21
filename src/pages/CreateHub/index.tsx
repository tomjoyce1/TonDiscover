import { Link, useSearchParams } from 'react-router-dom';
import { Boxes, FileText, MessageCircle, Rocket } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { Card, cardStyles } from '@/components/ui/Card.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';

const CreateHub = () => {
  const [searchParams] = useSearchParams();
  const { savedEntities } = useAppState();
  const hasSavedEntities = savedEntities.length > 0;
  const defaultOverviewEntityId = savedEntities[0]?.id ?? '';
  const savedEntityId = searchParams.get('saved');
  const savedEntity = savedEntities.find((entity) => entity.id === savedEntityId);
  const tileClassName = cx(cardStyles({ padding: 'md' }), 'w-full flex items-center gap-4');
  const tileDisabledClassName = cx(tileClassName, 'opacity-60');

  return (
    <PageShell title="Create" subtitle="Register your channel/app or publish a post.">
      {savedEntity && (
        <Card variant="success">
          <p className="text-sm text-tg-primary">
            Saved: <strong>{savedEntity.name}</strong>. You can now create a post for it.
          </p>
        </Card>
      )}

      <section className="space-y-3">
        <Link to="/create/register" className={tileClassName}>
          <div className="w-12 h-12 rounded-full bg-tg-accent/20 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-tg-accent" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-tg-primary">Register Channel / App</h3>
            <p className="text-xs text-tg-muted">Add your Telegram entity</p>
          </div>
        </Link>

        {hasSavedEntities ? (
          <Link
            to={`/create/overview/${encodeURIComponent(defaultOverviewEntityId)}`}
            className={tileClassName}
          >
            <div className="w-12 h-12 rounded-full bg-tg-success/20 flex items-center justify-center">
              <Boxes className="w-6 h-6 text-tg-success" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-tg-primary">Channels Overview</h3>
              <p className="text-xs text-tg-muted">Manage your saved entities</p>
            </div>
          </Link>
        ) : (
          <div className={tileDisabledClassName}>
            <div className="w-12 h-12 rounded-full bg-tg-input flex items-center justify-center">
              <Boxes className="w-6 h-6 text-tg-muted" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-tg-primary">Channels Overview</h3>
              <p className="text-xs text-tg-muted">Add a channel/app first</p>
            </div>
          </div>
        )}

        {hasSavedEntities ? (
          <Link to="/create/post" className={tileClassName}>
            <div className="w-12 h-12 rounded-full bg-tg-boost/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-tg-boost" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-tg-primary">Create Post</h3>
              <p className="text-xs text-tg-muted">Publish featured content</p>
            </div>
          </Link>
        ) : (
          <div className={tileDisabledClassName}>
            <div className="w-12 h-12 rounded-full bg-tg-input flex items-center justify-center">
              <FileText className="w-6 h-6 text-tg-muted" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-tg-primary">Create Post</h3>
              <p className="text-xs text-tg-muted">Add a channel/app first</p>
            </div>
          </div>
        )}

        <Link to="/create/boost" className={tileClassName}>
          <div className="w-12 h-12 rounded-full bg-tg-boost/20 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-tg-boost" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-tg-primary">Boost</h3>
            <p className="text-xs text-tg-muted">Increase discovery visibility</p>
          </div>
        </Link>
      </section>
    </PageShell>
  );
};

export default CreateHub;
