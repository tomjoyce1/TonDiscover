import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BoostBadge } from '@/components/common/BoostBadge.tsx';
import { getVideoLinkStatus, isRenderableMediaUrl, normalizeMediaUrl } from '@/helpers/media-url.ts';
import type { BoostState, Entity, FeaturedContent } from '@/types/tondiscover.ts';
import { isBoostActive } from '@/domain/ranking.ts';
import { cx } from '@/helpers/class-name.ts';

type DiscoveryTileProps = {
  entity: Entity;
  featuredContent?: FeaturedContent;
  boostState?: BoostState;
  isPost?: boolean;
  className?: string;
  onSelect?: (entityId: string, postId?: string) => void;
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
  previewTitle?: string;
  previewText?: string;
};

const TileMedia = ({
  contentType,
  mediaUrl,
  entityName,
  gradient,
  categoryIcon,
  previewTitle,
  previewText,
}: TileMediaProps) => {
  const normalizedMediaUrl = normalizeMediaUrl(mediaUrl);
  const isRenderableUrl = isRenderableMediaUrl(normalizedMediaUrl);
  const shouldShowFallback = !normalizedMediaUrl || !isRenderableUrl;
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const videoStatus = getVideoLinkStatus(normalizedMediaUrl);

  useEffect(() => {
    if (contentType !== 'video' || !normalizedMediaUrl || !mediaRef.current || videoStatus === 'page') {
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
  }, [contentType, normalizedMediaUrl, videoStatus]);

  useEffect(() => {
    setVideoFailed(false);
    setImageFailed(false);
  }, [contentType, normalizedMediaUrl]);
  const textSnippet = previewText?.trim() || previewTitle?.trim() || `${entityName} update`;

  if (contentType === 'text') {
    return (
      <div className={`h-full w-full bg-gradient-to-br ${gradient} px-3`}>
        <div className="flex h-full items-center justify-center pt-10 pb-14">
          <p className="line-clamp-3 break-words text-center text-[16px] font-extrabold leading-tight text-white drop-shadow-sm [overflow-wrap:anywhere]">
            {textSnippet}
          </p>
        </div>
      </div>
    );
  }

  if (shouldShowFallback || imageFailed) {
    return (
      <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-xl opacity-35 font-semibold tracking-wide">{categoryIcon}</span>
      </div>
    );
  }

  if (contentType === 'video') {
    if (videoStatus === 'page' || videoFailed) {
      return (
        <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-semibold text-white">
            Unsupported video link
          </span>
        </div>
      );
    }

    return (
      <div ref={mediaRef} className="h-full w-full">
        {shouldLoadVideo ? (
          <video
            src={normalizedMediaUrl}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            onError={() => setVideoFailed(true)}
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
      src={normalizedMediaUrl}
      alt={entityName}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setImageFailed(true)}
    />
  );
};

export const DiscoveryTile = memo(({
  entity,
  featuredContent,
  boostState,
  isPost,
  className,
  onSelect,
}: DiscoveryTileProps) => {
  const previewText = featuredContent?.text ?? entity.previewText ?? entity.shortDescription;
  const previewTitle = featuredContent?.title;
  const previewMediaUrl = featuredContent?.mediaUrl ?? entity.previewMediaUrl;
  const previewType = featuredContent?.contentType ?? entity.contentType;
  const boosted = isBoostActive(boostState);
  const gradient = CATEGORY_GRADIENTS[entity.category] ?? 'from-slate-800/60 to-slate-900/40';
  const categoryIcon = CATEGORY_ICONS[entity.category] ?? '\u2728';

  const Wrapper = onSelect
    ? ({ children }: { children: ReactNode }) => (
        <button
          type="button"
          onClick={() => onSelect(entity.id, isPost ? featuredContent?.id : undefined)}
          className={cx('block w-full touch-manipulation select-none text-left', className)}
        >
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
      <article className="group relative flex h-56 cursor-pointer touch-manipulation flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 active:scale-[0.97]">
        {/* Cover */}
        <div className="absolute inset-0 pointer-events-none">
          <TileMedia
            contentType={previewType}
            mediaUrl={previewMediaUrl}
            entityName={entity.name}
            gradient={gradient}
            categoryIcon={categoryIcon}
            previewTitle={previewTitle}
            previewText={previewText}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,17,30,0.95)_0%,rgba(13,17,30,0.5)_45%,rgba(13,17,30,0.1)_100%)]" />
        </div>

        {/* Type badge + boost */}
        <div className="pointer-events-none relative flex items-start justify-between p-3">
          <BoostBadge active={boosted} source={boostState?.source} />
          <div className="flex items-center gap-1.5">
            {isPost ? (
              <span className="rounded-full border border-violet-500/35 bg-violet-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                Post
              </span>
            ) : (
              <span className={cx('rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider', typeColors[entity.type] ?? typeColors.app)}>
                {entity.type}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pointer-events-none relative mt-auto px-3.5 pb-3.5">
          <p
            className={cx(
              'mb-1.5 line-clamp-2 break-words text-[13px] leading-snug [overflow-wrap:anywhere]',
              previewType === 'text' ? 'font-semibold text-white/85' : 'font-medium text-white/60',
            )}
          >
            {previewText?.slice(0, 92)}
          </p>
          <h3 className="line-clamp-1 text-lg font-extrabold leading-tight text-white">{entity.name}</h3>
        </div>
      </article>
    </Wrapper>
  );
});

DiscoveryTile.displayName = 'DiscoveryTile';
