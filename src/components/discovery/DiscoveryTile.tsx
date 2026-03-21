import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BoostBadge } from '@/components/common/BoostBadge.tsx';
import type { BoostState, Entity, FeaturedContent } from '@/types/tondiscover.ts';
import { isBoostActive } from '@/domain/ranking.ts';
import { cx } from '@/helpers/class-name.ts';

type DiscoveryTileProps = {
  entity: Entity;
  featuredContent?: FeaturedContent;
  boostState?: BoostState;
  className?: string;
  onSelect?: (entityId: string) => void;
};

/* Colored type badges matching _imports design */
const typeColors: Record<string, string> = {
  app: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  channel: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

/* Category-themed gradient for text-only placeholders */
const CATEGORY_GRADIENTS: Record<string, string> = {
  DeFi: 'from-sky-900/60 to-sky-950/40',
  Games: 'from-violet-900/60 to-violet-950/40',
  News: 'from-rose-900/60 to-rose-950/40',
  Education: 'from-amber-900/60 to-amber-950/40',
  Community: 'from-emerald-900/60 to-emerald-950/40',
  Tools: 'from-slate-800/60 to-slate-900/40',
};

const CATEGORY_ICONS: Record<string, string> = {
  DeFi: '\uD83D\uDCB1',
  Games: '\uD83C\uDFAE',
  News: '\uD83D\uDCF0',
  Education: '\u26A1',
  Community: '\uD83C\uDF10',
  Tools: '\uD83D\uDD27',
};

type TileMediaProps = {
  contentType: Entity['contentType'];
  mediaUrl?: string;
  entityName: string;
  gradient: string;
  categoryIcon: string;
};

const TileMedia = ({ contentType, mediaUrl, entityName, gradient, categoryIcon }: TileMediaProps) => {
  const shouldShowFallback = contentType === 'text' || !mediaUrl;
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const mediaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (contentType !== 'video' || !mediaUrl || !mediaRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        setShouldLoadVideo(true);
        observer.disconnect();
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(mediaRef.current);
    return () => observer.disconnect();
  }, [contentType, mediaUrl]);

  if (shouldShowFallback) {
    return (
      <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-xl opacity-35 font-semibold tracking-wide">{categoryIcon}</span>
      </div>
    );
  }

  if (contentType === 'video') {
    return (
      <div ref={mediaRef} className="h-full w-full">
        {shouldLoadVideo ? (
          <video
            src={mediaUrl}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-semibold text-white">
              Video
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={mediaUrl}
      alt={entityName}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  );
};

export const DiscoveryTile = memo(({
  entity,
  featuredContent,
  boostState,
  className,
  onSelect,
}: DiscoveryTileProps) => {
  const previewText = featuredContent?.text ?? entity.previewText ?? entity.shortDescription;
  const previewMediaUrl = featuredContent?.mediaUrl ?? entity.previewMediaUrl;
  const previewType = featuredContent?.contentType ?? entity.contentType;
  const boosted = isBoostActive(boostState);
  const gradient = CATEGORY_GRADIENTS[entity.category] ?? 'from-slate-800/60 to-slate-900/40';
  const categoryIcon = CATEGORY_ICONS[entity.category] ?? '\u2728';

  const Wrapper = onSelect
    ? ({ children }: { children: ReactNode }) => (
        <button type="button" onClick={() => onSelect(entity.id)} className={cx('block w-full text-left', className)}>
          {children}
        </button>
      )
    : ({ children }: { children: ReactNode }) => (
        <Link to={`/entity/${entity.id}`} className={cx('block', className)}>
          {children}
        </Link>
      );

  return (
    <Wrapper>
      <article className="group relative flex h-56 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 active:scale-[0.97]">
        {/* Cover */}
        <div className="absolute inset-0">
          <TileMedia
            contentType={previewType}
            mediaUrl={previewMediaUrl}
            entityName={entity.name}
            gradient={gradient}
            categoryIcon={categoryIcon}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,17,30,0.95)_0%,rgba(13,17,30,0.5)_45%,rgba(13,17,30,0.1)_100%)]" />
        </div>

        {/* Type badge + boost */}
        <div className="relative flex items-start justify-between p-3">
          <BoostBadge active={boosted} source={boostState?.source} />
          <span className={cx('rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider', typeColors[entity.type] ?? typeColors.app)}>
            {entity.type}
          </span>
        </div>

        {/* Content */}
        <div className="relative mt-auto px-3.5 pb-3.5">
          <p className="mb-1.5 line-clamp-1 text-[13px] font-medium leading-snug text-white/60">{previewText?.slice(0, 60)}</p>
          <h3 className="line-clamp-1 text-lg font-extrabold leading-tight text-white">{entity.name}</h3>
        </div>
      </article>
    </Wrapper>
  );
});

DiscoveryTile.displayName = 'DiscoveryTile';
