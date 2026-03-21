import { Link } from 'react-router-dom';
import { BoostBadge } from '@/components/common/BoostBadge.tsx';
import { MediaPreview } from '@/components/discovery/MediaPreview.tsx';
import type { BoostState, Entity, FeaturedContent } from '@/types/tondiscover.ts';
import { isBoostActive } from '@/domain/ranking.ts';

type DiscoveryTileProps = {
  entity: Entity;
  featuredContent?: FeaturedContent;
  boostState?: BoostState;
};

export const DiscoveryTile = ({ entity, featuredContent, boostState }: DiscoveryTileProps) => {
  const previewText = featuredContent?.text ?? entity.previewText ?? entity.shortDescription;
  const previewMediaUrl = featuredContent?.mediaUrl ?? entity.previewMediaUrl;
  const previewType = featuredContent?.contentType ?? entity.contentType;
  const boosted = isBoostActive(boostState);

  return (
    <article className="td-tile">
      <MediaPreview
        contentType={previewType}
        mediaUrl={previewMediaUrl}
        text={previewText}
      />
      <div className="td-tile-body">
        <div className="td-tile-meta">
          <span>{entity.type}</span>
          <span>{entity.category}</span>
        </div>
        <h3>{entity.name}</h3>
        <p>{entity.shortDescription}</p>
        <BoostBadge active={boosted} source={boostState?.source} />
        <Link to={`/entity/${entity.id}`} className="td-link-button">
          Open
        </Link>
      </div>
    </article>
  );
};
