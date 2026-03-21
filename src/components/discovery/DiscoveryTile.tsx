import { Link } from 'react-router-dom';
import { BoostBadge } from '@/components/common/BoostBadge.tsx';
import { buttonStyles } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import type { BoostState, Entity, FeaturedContent } from '@/types/tondiscover.ts';
import { isBoostActive } from '@/domain/ranking.ts';

type DiscoveryTileProps = {
  entity: Entity;
  featuredContent?: FeaturedContent;
  boostState?: BoostState;
};

const toTitle = (value?: string): string => {
  if (!value) {
    return 'TONDiscover';
  }
  return value.slice(0, 56);
};

export const DiscoveryTile = ({ entity, featuredContent, boostState }: DiscoveryTileProps) => {
  const previewText = featuredContent?.text ?? entity.previewText ?? entity.shortDescription;
  const previewMediaUrl = featuredContent?.mediaUrl ?? entity.previewMediaUrl;
  const previewType = featuredContent?.contentType ?? entity.contentType;
  const boosted = isBoostActive(boostState);
  const ctaLabel = entity.type === 'app' ? 'View app' : 'View channel';

  const renderMedia = () => {
    if (previewType === 'video' && previewMediaUrl) {
      return (
        <video
          src={previewMediaUrl}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
        />
      );
    }

    if (previewType !== 'text' && previewMediaUrl) {
      return (
        <img
          src={previewMediaUrl}
          alt={entity.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#274B67] to-[#1A2733] flex items-center justify-center p-3">
        <p className="text-sm text-white text-center line-clamp-2">{toTitle(previewText)}</p>
      </div>
    );
  };

  return (
    <Card as="article" padding="none" className="relative flex flex-col overflow-hidden">
      <Link to={`/entity/${entity.id}`} className="relative aspect-[3/4] overflow-hidden">
        {renderMedia()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <BoostBadge active={boosted} source={boostState?.source} />
          </div>
          <Chip size="sm" className="bg-black/40 border-white/20 text-white text-[10px] capitalize">
            {entity.type}
          </Chip>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white truncate">{entity.name}</h3>
          <p className="text-xs text-tg-muted line-clamp-2 mt-1">
            {toTitle(featuredContent?.title ?? previewText)}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {entity.tags.slice(0, 2).map((tag) => (
              <Chip key={tag} variant="muted" size="sm" className="text-[10px]">
                #{tag}
              </Chip>
            ))}
          </div>
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-tg-muted mb-2">
          <span>{entity.category}</span>
          <span className="capitalize">{entity.type}</span>
        </div>
        <Link
          to={`/entity/${entity.id}`}
          className={buttonStyles({
            variant: 'primary',
            size: 'sm',
            fullWidth: true,
            className: 'text-xs',
          })}
        >
          {ctaLabel}
        </Link>
      </div>
    </Card>
  );
};
