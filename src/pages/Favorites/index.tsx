import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';

const CATEGORY_META: Record<string, { icon: string; gradient: string }> = {
  DeFi:      { icon: '💱', gradient: 'from-sky-900/60 to-sky-950/40' },
  Games:     { icon: '🎮', gradient: 'from-violet-900/60 to-violet-950/40' },
  Tools:     { icon: '🔧', gradient: 'from-slate-800/60 to-slate-900/40' },
  Community: { icon: '🌐', gradient: 'from-emerald-900/60 to-emerald-950/40' },
  Education: { icon: '⚡', gradient: 'from-amber-900/60 to-amber-950/40' },
  News:      { icon: '📰', gradient: 'from-rose-900/60 to-rose-950/40' },
};

const DEFAULT_META = { icon: '✨', gradient: 'from-slate-800/60 to-slate-900/40' };

const typeColors: Record<string, string> = {
  app: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  channel: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const Favorites = () => {
  const { entities, favorites, toggleFavorite, featuredContent } = useAppState();

  const favoriteEntities = useMemo(
    () => entities.filter((e) => favorites.favoriteAppIds.includes(e.id)),
    [entities, favorites.favoriteAppIds],
  );

  const featuredByEntityId = useMemo(() => {
    const m = new Map<string, (typeof featuredContent)[number]>();
    featuredContent.forEach((item) => {
      if (!m.has(item.entityId)) {
        m.set(item.entityId, item);
      }
    });
    return m;
  }, [featuredContent]);

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/profile"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Favorites</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {favoriteEntities.length} saved {favoriteEntities.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </header>

      {favoriteEntities.length === 0 ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-10">
          <div className="w-20 h-20 rounded-2xl border border-border bg-card flex items-center justify-center mb-5">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-2">No favorites yet</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tap the heart on any channel or app to save it here for quick access.
          </p>
          <Link
            to="/explore"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.97]"
          >
            <Sparkles className="h-4 w-4" />
            Explore
          </Link>
        </div>
      ) : (
        /* Favorites grid */
        <section className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {favoriteEntities.map((entity) => {
              const meta = CATEGORY_META[entity.category] ?? DEFAULT_META;
              const fc = featuredByEntityId.get(entity.id);
              const previewMediaUrl = fc?.mediaUrl ?? entity.previewMediaUrl;
              const previewType = fc?.contentType ?? entity.contentType;
              const hasMedia = previewType !== 'text' && previewMediaUrl;

              return (
                <div key={entity.id} className="relative">
                  <Link to={`/entity/${entity.id}`} className="block">
                    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 active:scale-[0.97] h-48">
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
                          <div className={`h-full w-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                            <span className="text-4xl opacity-30">{meta.icon}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,17,30,0.95)_0%,rgba(13,17,30,0.45)_50%,rgba(13,17,30,0.1)_100%)]" />
                      </div>

                      {/* Type badge */}
                      <div className="relative flex items-start justify-end p-3">
                        <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', typeColors[entity.type] ?? typeColors.app)}>
                          {entity.type}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="relative mt-auto px-3.5 pb-3.5">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1">{entity.name}</h3>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-1 line-clamp-2">{entity.shortDescription}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {entity.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Link>

                  {/* Favorite button */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(entity.id)}
                    className="absolute top-2.5 left-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all active:scale-90"
                    aria-label="Remove from favorites"
                  >
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <BottomNav />
    </main>
  );
};

export default Favorites;
