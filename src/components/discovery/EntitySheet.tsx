import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Heart, Pencil, Trash2, X, Zap } from 'lucide-react';
import { useAppState } from '@/context/app-context.tsx';
import { isBoostActive } from '@/domain/ranking.ts';
import { cx } from '@/helpers/class-name.ts';
import { getVideoLinkStatus, isRenderableMediaUrl, normalizeMediaUrl } from '@/helpers/media-url.ts';
import { openTelegramAwareLink } from '@/services/telegram/open-link.ts';

const CATEGORY_GRADIENTS: Record<string, string> = {
  DeFi: 'from-sky-900/60 to-sky-950/40',
  Games: 'from-violet-900/60 to-violet-950/40',
  News: 'from-rose-900/60 to-rose-950/40',
  Education: 'from-amber-900/60 to-amber-950/40',
  Community: 'from-emerald-900/60 to-emerald-950/40',
  Tools: 'from-slate-800/60 to-slate-900/40',
};
const CATEGORY_ICONS: Record<string, string> = {
  DeFi: '💱', Games: '🎮', News: '📰', Education: '⚡', Community: '🌐', Tools: '🔧',
};

type EntitySheetProps = {
  entityId: string | null;
  postId?: string | null;
  onClose: () => void;
};

export const EntitySheet = ({ entityId, postId, onClose }: EntitySheetProps) => {
  const navigate = useNavigate();
  const {
    entities, featuredContent, isFavorite, toggleFavorite,
    recordOpen, recordLaunch, deleteEntity, deleteFeaturedContent, getBoostState, isOwnedEntity,
  } = useAppState();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [heroMediaFailed, setHeroMediaFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const open = useCallback(() => {
    clearTimeout(timerRef.current);
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    onClose();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setMounted(false);
      setActiveEntityId(null);
      setActivePostId(null);
    }, 300);
  }, [onClose]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (entityId) {
      setActiveEntityId(entityId);
      setActivePostId(postId ?? null);
      open();
    }
    else if (mounted) close();
  }, [close, entityId, mounted, open, postId]);

  useEffect(() => {
    if (entityId) {
      setActivePostId(postId ?? null);
    }
  }, [entityId, postId]);

  useEffect(() => {
    setHeroMediaFailed(false);
  }, [activeEntityId, activePostId]);

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (mounted) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [mounted]);

  const entity = activeEntityId ? entities.find((e) => e.id === activeEntityId) : undefined;

  useEffect(() => {
    if (entity && visible) recordOpen(entity.id);
  }, [entity, visible, recordOpen]);

  if (!mounted || !entity) return null;

  const selectedPost = activePostId
    ? featuredContent.find((fc) => fc.id === activePostId && fc.entityId === entity.id)
    : undefined;
  const postBoost = selectedPost ? getBoostState(selectedPost.id) : undefined;
  const entityBoost = getBoostState(entity.id);
  const boost = selectedPost && postBoost && isBoostActive(postBoost)
    ? postBoost
    : entityBoost;
  const boosted = isBoostActive(boost);
  const gradient = CATEGORY_GRADIENTS[entity.category] ?? 'from-slate-800/60 to-slate-900/40';
  const catIcon = CATEGORY_ICONS[entity.category] ?? '✨';
  const previewMediaUrl = normalizeMediaUrl(selectedPost?.mediaUrl ?? entity.previewMediaUrl);
  const previewType = selectedPost?.contentType ?? entity.contentType;
  const previewText = selectedPost?.text ?? entity.previewText ?? entity.shortDescription;
  const previewTitle = selectedPost?.title ?? entity.name;
  const previewVideoStatus = getVideoLinkStatus(previewMediaUrl);
  const hasMedia = previewType !== 'text' && previewMediaUrl && isRenderableMediaUrl(previewMediaUrl);
  const owned = isOwnedEntity(entity.id);
  const fav = isFavorite(entity.id);

  const onPrimaryAction = () => {
    if (entity.type === 'app') recordLaunch(entity.id);
    else recordOpen(entity.id);
    openTelegramAwareLink(entity.telegramUrl);
  };
  const editLabel = selectedPost ? 'Edit Post' : (entity.type === 'channel' ? 'Edit Channel' : 'Edit App');
  const editHref = selectedPost
    ? `/create/post?postId=${encodeURIComponent(selectedPost.id)}&edit=1`
    : `/create/overview/${encodeURIComponent(entity.id)}`;

  const onDelete = () => {
    if (selectedPost) {
      deleteFeaturedContent(selectedPost.id);
      close();
      return;
    }
    deleteEntity(entity.id);
    close();
  };
  const onOverlay = (ev: MouseEvent<HTMLDivElement>) => { if (ev.target === ev.currentTarget) close(); };

  return (
    <div
      className={cx(
        'fixed inset-0 z-50 flex items-center justify-center px-2 py-2',
        visible ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      onClick={onOverlay}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* Floating card */}
      <div
        className="relative w-full h-full flex flex-col bg-background rounded-[24px] overflow-hidden transition-all duration-300 ease-out"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.9)',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Hero section */}
          <div className="relative h-72">
            {previewType === 'video' && previewMediaUrl && previewVideoStatus !== 'page' && !heroMediaFailed ? (
              <video
                src={previewMediaUrl}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
                onError={() => setHeroMediaFailed(true)}
              />
            ) : hasMedia && previewType !== 'video' && !heroMediaFailed ? (
              <img src={previewMediaUrl} alt={entity.name} className="h-full w-full object-cover" onError={() => setHeroMediaFailed(true)} />
            ) : previewType === 'text' ? (
              <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-7xl opacity-20">{catIcon}</span>
              </div>
            )}

            {/* Full gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            {previewType === 'text' ? (
              <div className="pointer-events-none absolute inset-x-5 top-16 bottom-24 flex items-center justify-center">
                <p className="line-clamp-4 max-w-[18rem] break-words text-center text-[23px] font-extrabold leading-[1.2] text-white drop-shadow-sm [overflow-wrap:anywhere]">
                  {previewText?.trim() || previewTitle}
                </p>
              </div>
            ) : null}
            {previewType === 'video' && (previewVideoStatus === 'page' || heroMediaFailed) ? (
              <div className="pointer-events-none absolute inset-x-5 top-16 bottom-24 flex items-center justify-center">
                <span className="rounded-full border border-white/25 bg-black/45 px-4 py-1.5 text-xs font-semibold text-white">
                  Use direct .mp4/.webm link
                </span>
              </div>
            ) : null}

            {/* Top bar: type badge (left) + close button (right) */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <span className={cx(
                  'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm',
                  entity.type === 'app'
                    ? 'bg-sky-500/25 text-sky-200'
                    : 'bg-emerald-500/25 text-emerald-200',
                )}>
                  {entity.type}
                </span>
                {selectedPost ? (
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-violet-500/25 text-violet-200 backdrop-blur-sm">
                    Post
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={close}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all active:scale-90"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Title area at bottom of hero */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
              <div className="flex items-center gap-2 mb-1.5">
                {boosted && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                    Boosted
                  </span>
                )}
              </div>
              <h2 className="text-[26px] font-extrabold text-white leading-tight tracking-tight">
                {selectedPost?.title?.trim() || entity.name}
              </h2>
              <p className="text-[13px] text-white/50 font-medium mt-1 capitalize">
                {selectedPost ? `Post · ${entity.category}` : entity.category}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pt-4 pb-10 space-y-5">
            {previewType === 'text' && previewText ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-white/45">Latest post</p>
                <p className="mt-2 line-clamp-4 break-words whitespace-pre-wrap text-[17px] font-bold leading-[1.45] text-white/90 [overflow-wrap:anywhere]">
                  {previewText}
                </p>
              </div>
            ) : null}

            {/* Description */}
            <p className="line-clamp-4 break-words text-[15px] text-white/75 font-medium leading-[1.65] [overflow-wrap:anywhere]">
              {entity.longDescription ?? entity.shortDescription}
            </p>

            {/* Tags */}
            {entity.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entity.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.06] text-[12px] text-white/50 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Primary actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="flex-1 flex items-center justify-center gap-2.5 h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] transition-all active:scale-[0.97]"
              >
                <ExternalLink className="w-[18px] h-[18px]" />
                {entity.type === 'app' ? 'Launch App' : 'Join Channel'}
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(entity.id)}
                className={cx(
                  'flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl transition-all active:scale-[0.93]',
                  fav ? 'bg-rose-500/15' : 'bg-white/[0.06]',
                )}
                aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={cx('w-5 h-5', fav ? 'fill-rose-500 text-rose-500' : 'text-white/40')} />
              </button>
            </div>

            {/* Owner actions */}
            {owned && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate(editHref)}
                  className="flex-1 flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-primary/10 text-primary font-bold text-[15px] transition-all active:scale-[0.97]"
                >
                  <Pencil className="w-4 h-4" />
                  {editLabel}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(
                    selectedPost
                      ? `/create/boost?targetId=${encodeURIComponent(selectedPost.id)}&targetType=post`
                      : `/create/boost?targetId=${encodeURIComponent(entity.id)}&targetType=entity`,
                  )}
                  className="flex-1 flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-amber-500/10 text-amber-300 font-bold text-[15px] transition-all active:scale-[0.97]"
                >
                  <Zap className="w-4 h-4" />
                  Boost
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="col-span-2 flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-rose-500/10 text-rose-400 font-bold text-[15px] transition-all active:scale-[0.97]"
                >
                  <Trash2 className="w-4 h-4" />
                  {selectedPost ? 'Delete Post' : 'Delete Entity'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
