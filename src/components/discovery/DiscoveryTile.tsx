import type { ReactNode } from 'react';
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
  DeFi:      'from-sky-900/60 to-sky-950/40',
  Games:     'from-violet-900/60 to-violet-950/40',
  News:      'from-rose-900/60 to-rose-950/40',
  Education: 'from-amber-900/60 to-amber-950/40',
  Community: 'from-emerald-900/60 to-emerald-950/40',
  Tools:     'from-slate-800/60 to-slate-900/40',
};

const CATEGORY_ICONS: Record<string, string> = {
  DeFi: '💱', Games: '🎮', News: '📰', Education: '⚡', Community: '🌐', Tools: '🔧',
};

export const DiscoveryTile = ({ entity, featuredContent, boostState, className, onSelect }: DiscoveryTileProps) => {
  const previewText = featuredContent?.text ?? entity.previewText ?? entity.shortDescription;
  const previewMediaUrl = featuredContent?.mediaUrl ?? entity.previewMediaUrl;
  const previewType = featuredContent?.contentType ?? entity.contentType;
  const boosted = isBoostActive(boostState);
  const gradient = CATEGORY_GRADIENTS[entity.category] ?? 'from-slate-800/60 to-slate-900/40';

  const hasMedia = previewType !== 'text' && previewMediaUrl;

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
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 active:scale-[0.97] cursor-pointer h-56">
        {/* Cover */}
        <div className="absolute inset-0">
          {previewType === 'video' && previewMediaUrl ? (
            <video
              src={previewMediaUrl}
              className="h-full w-full object-cover"
              muted loop playsInline autoPlay preload="metadata"
            />
          ) : hasMedia ? (
            <img src={previewMediaUrl} alt={entity.name} className="h-full w-full object-cover" />
          ) : (
            /* Category-themed placeholder */
            <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-4xl opacity-30">{CATEGORY_ICONS[entity.category] ?? '✨'}</span>
            </div>
          )}
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
          <p className="text-[13px] text-white/60 font-medium leading-snug mb-1.5 line-clamp-1">{previewText?.slice(0, 60)}</p>
          <h3 className="font-extrabold text-white text-lg leading-tight line-clamp-1">{entity.name}</h3>
        </div>
      </article>
    </Wrapper>
  );
};
