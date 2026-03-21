import { Link, useNavigate, useParams } from 'react-router-dom';
import { BoostBadge } from '@/components/common/BoostBadge.tsx';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { MediaPreview } from '@/components/discovery/MediaPreview.tsx';
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
    getBoostState,
  } = useAppState();

  const entity = entities.find((item) => item.id === id);

  if (!entity) {
    return (
      <PageShell title="Entity not found" backTo="/explore">
          <p className="td-muted">Unknown entity ID.</p>
          <Link to="/explore" className="td-link-button td-inline-link">
            Back to Explore
          </Link>
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
    <PageShell title="Entity Detail" backTo="/explore">
        <MediaPreview
          contentType={featured?.contentType ?? entity.contentType}
          mediaUrl={featured?.mediaUrl ?? entity.previewMediaUrl}
          text={featured?.text ?? entity.previewText ?? entity.shortDescription}
        />
        <div className="td-card">
          <div className="td-tile-meta">
            <span>{entity.type}</span>
            <span>{entity.category}</span>
          </div>
          <h2>{entity.name}</h2>
          <p>{entity.longDescription ?? entity.shortDescription}</p>
          <BoostBadge active={boosted} source={boost.source} />
          <div className="td-button-row">
            <button type="button" className="td-primary-button" onClick={onPrimaryAction}>
              {entity.type === 'app' ? 'Launch App' : 'Join Channel'}
            </button>
            {entity.type === 'app' && (
              <button
                type="button"
                className="td-pill-button"
                onClick={() => toggleFavorite(entity.id)}
              >
                {isFavorite(entity.id) ? 'Unfavorite' : 'Favorite'}
              </button>
            )}
          </div>
          <button
            type="button"
            className="td-pill-button td-inline-link"
            onClick={() => navigate(`/create/boost?entityId=${encodeURIComponent(entity.id)}`)}
          >
            Boost this entity
          </button>
        </div>
    </PageShell>
  );
};

export default EntityDetail;
