import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink, Star, Trash2, Zap } from 'lucide-react';
import { BoostBadge } from '@/components/common/BoostBadge.tsx';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { MediaPreview } from '@/components/discovery/MediaPreview.tsx';
import { Button, buttonStyles } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { isBoostActive } from '@/domain/ranking.ts';

const EntityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    entities,
    featuredContent,
    isFavorite,
    toggleFavorite,
    recordLaunch,
    recordOpen,
    deleteEntity,
    getBoostState,
    isOwnedEntity,
  } = useAppState();

  const entity = entities.find((item) => item.id === id);

  // Record view on mount
  useEffect(() => {
    if (entity) recordOpen(entity.id);
  }, [entity, recordOpen]);

  if (!entity) {
    return (
      <PageShell title="Entity not found" backTo="/explore">
        <Card>
          <p className="text-sm text-tg-muted">Unknown entity ID.</p>
          <Link
            to="/explore"
            className={buttonStyles({
              variant: 'primary',
              size: 'md',
              className: 'mt-4',
            })}
          >
            Back to Discover
          </Link>
        </Card>
      </PageShell>
    );
  }

  const featured = featuredContent.find((item) => item.entityId === entity.id);
  const boost = getBoostState(entity.id);
  const boosted = isBoostActive(boost);

  const onPrimaryAction = () => {
    if (entity.type === 'app') {
      recordLaunch(entity.id);
    } else {
      recordOpen(entity.id);
    }

    window.open(entity.telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageShell title={entity.name} backTo="/explore">
      <section className="-mx-4 overflow-hidden">
        <MediaPreview
          contentType={featured?.contentType ?? entity.contentType}
          mediaUrl={featured?.mediaUrl ?? entity.previewMediaUrl}
          text={featured?.text ?? entity.previewText ?? entity.shortDescription}
        />
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-tg-primary">{entity.name}</h2>
              {boosted && <BoostBadge active={boosted} source={boost.source} />}
            </div>
            <p className="text-xs text-tg-muted mt-1 capitalize">{entity.type} • {entity.category}</p>
          </div>
        </div>

        <p className="text-sm text-tg-muted leading-relaxed mb-4">
          {entity.longDescription ?? entity.shortDescription}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {entity.tags.map((tag) => (
            <Chip key={tag} variant="muted">
              #{tag}
            </Chip>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="primary" size="lg" className="flex-1" onClick={onPrimaryAction}>
            <ExternalLink className="w-4 h-4" />
            {entity.type === 'app' ? 'Launch App' : 'Join Channel'}
          </Button>
          {entity.type === 'app' && (
            <Button
              variant="secondary"
              size="lg"
              className="px-4"
              onClick={() => toggleFavorite(entity.id)}
              aria-label={isFavorite(entity.id) ? 'Unfavorite app' : 'Favorite app'}
            >
              <Star className={isFavorite(entity.id) ? 'w-4 h-4 fill-yellow-400 text-yellow-400' : 'w-4 h-4 text-tg-muted'} />
            </Button>
          )}
        </div>
      </Card>

      <Card>
        {isOwnedEntity(entity.id) ? (
          <div className="space-y-3">
            <Button
              variant="boost"
              size="lg"
              fullWidth
              onClick={() => navigate(`/create/boost?entityId=${encodeURIComponent(entity.id)}`)}
            >
              <Zap className="w-4 h-4" />
              Boost this entity
            </Button>
            <button
              type="button"
              onClick={() => { deleteEntity(entity.id); navigate('/explore'); }}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 font-semibold text-sm transition-all active:scale-[0.97]"
            >
              <Trash2 className="w-4 h-4" />
              Delete post
            </button>
          </div>
        ) : (
          <p className="text-sm text-tg-muted">Boost is available only for your own entities/posts.</p>
        )}
      </Card>
    </PageShell>
  );
};

export default EntityDetail;
