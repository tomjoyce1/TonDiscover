import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LayoutGrid, Search, SlidersHorizontal, TrendingUp, X } from 'lucide-react';
import { EntitySheet } from '@/components/discovery/EntitySheet.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { isBoostActive } from '@/domain/ranking.ts';
import { cx } from '@/helpers/class-name.ts';

/* ── Visual config ── */
const trendingTagColors = [
  'text-sky-400', 'text-emerald-400', 'text-amber-400', 'text-rose-400',
  'text-violet-400', 'text-cyan-400', 'text-lime-400', 'text-orange-400',
  'text-pink-400', 'text-teal-400',
];

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  DeFi:      { icon: '💱', color: 'from-sky-600/20 to-sky-500/5 border-sky-500/20' },
  Games:     { icon: '🎮', color: 'from-violet-600/20 to-violet-500/5 border-violet-500/20' },
  Tools:     { icon: '🔧', color: 'from-slate-600/20 to-slate-500/5 border-slate-500/20' },
  Community: { icon: '🌐', color: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/20' },
  Education: { icon: '⚡', color: 'from-amber-600/20 to-amber-500/5 border-amber-500/20' },
  News:      { icon: '📰', color: 'from-rose-600/20 to-rose-500/5 border-rose-500/20' },
};

const DEFAULT_CAT = { icon: '✨', color: 'from-slate-600/20 to-slate-500/5 border-slate-500/20' };

const parseList = (v: string | null): string[] =>
  v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];
const normalize = (v: string): string => v.trim().toLowerCase();

const SearchHome = () => {
  const [searchParams] = useSearchParams();
  const { entities, categories, rankedEntities, featuredContent, getBoostState } = useAppState();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(parseList(searchParams.get('categories')));
  const [selectedTags, setSelectedTags] = useState<string[]>(parseList(searchParams.get('tags')));
  /* Entity detail sheet */
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const closeEntitySheet = useCallback(() => setSelectedEntityId(null), []);

  /* Filter sheet with slide-up / slide-down animation */
  const [filtersMounted, setFiltersMounted] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const filterTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const openFilters = useCallback(() => {
    setFiltersMounted(true);
    // Next frame: trigger the CSS transition
    requestAnimationFrame(() => requestAnimationFrame(() => setFiltersVisible(true)));
  }, []);

  const closeFilters = useCallback(() => {
    setFiltersVisible(false);
    clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => setFiltersMounted(false), 300);
  }, []);

  useEffect(() => () => clearTimeout(filterTimerRef.current), []);

  const featuredByEntityId = useMemo(() => {
    const m = new Map<string, (typeof featuredContent)[number]>();
    featuredContent.forEach((i) => m.set(i.entityId, i));
    return m;
  }, [featuredContent]);

  const tags = useMemo(
    () => Array.from(new Set(entities.flatMap((e) => e.tags))).sort((a, b) => a.localeCompare(b)),
    [entities],
  );
  const trendingTags = useMemo(() => tags.slice(0, 9), [tags]);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    entities.forEach((e) => { c[e.category] = (c[e.category] ?? 0) + 1; });
    return c;
  }, [entities]);

  const toggle = (items: string[], set: (n: string[]) => void, t: string) =>
    set(items.includes(t) ? items.filter((i) => i !== t) : [...items, t]);

  const filtered = useMemo(() =>
    rankedEntities.filter((e) => {
      const byCat = selectedCategories.length === 0 || selectedCategories.includes(e.category);
      const byTag = selectedTags.length === 0 || e.tags.some((t) => selectedTags.includes(t));
      return byCat && byTag;
    }),
  [rankedEntities, selectedCategories, selectedTags]);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return filtered;
    return filtered.filter((e) => {
      const fc = featuredByEntityId.get(e.id);
      return [e.name, e.shortDescription, e.longDescription ?? '', e.previewText ?? '', fc?.title ?? '', fc?.text ?? '']
        .map(normalize).some((f) => f.includes(q));
    });
  }, [featuredByEntityId, filtered, query]);

  const onOverlay = (ev: MouseEvent<HTMLDivElement>) => { if (ev.target === ev.currentTarget) closeFilters(); };
  const resetFilters = () => { setSelectedCategories([]); setSelectedTags([]); };
  const filterCount = selectedCategories.length + selectedTags.length;
  const hasSearch = Boolean(query.trim()) || filterCount > 0;

  return (
    <main className="flex min-h-screen flex-col bg-background pb-20 pt-6">
      {/* Search header */}
      <header className="flex items-center gap-3 px-4 pb-2">
        <Link
          to="/explore"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Channels, apps, tags…"
            autoFocus
            className="h-11 w-full rounded-xl border border-border bg-secondary pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-muted-foreground/20"
              onClick={() => setQuery('')}
              aria-label="Clear"
            >
              <X className="w-3 h-3 text-foreground" />
            </button>
          )}
        </div>

        <button
          onClick={openFilters}
          className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {filterCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1">
              {filterCount}
            </span>
          )}
        </button>
      </header>

      {/* Active filter pills */}
      {filterCount > 0 && (
        <div className="flex items-center gap-1.5 px-4 pb-2 overflow-x-auto no-scrollbar">
          {selectedCategories.map((c) => (
            <button key={c} type="button" onClick={() => toggle(selectedCategories, setSelectedCategories, c)}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-medium text-primary whitespace-nowrap">
              {c}<X className="w-3 h-3" />
            </button>
          ))}
          {selectedTags.map((t) => (
            <button key={t} type="button" onClick={() => toggle(selectedTags, setSelectedTags, t)}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full border border-border bg-secondary text-[11px] font-medium text-foreground whitespace-nowrap">
              #{t}<X className="w-3 h-3 text-muted-foreground" />
            </button>
          ))}
          <button type="button" onClick={resetFilters} className="text-[11px] text-primary whitespace-nowrap px-2 py-1 font-medium">
            Clear
          </button>
        </div>
      )}

      {/* Content */}
      {hasSearch ? (
        <div className="px-4 pt-4 pb-6 space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            {query.trim()
              ? <>Searching for <span className="font-semibold text-foreground">&ldquo;{query.trim()}&rdquo;</span> &middot; {results.length} found</>
              : <>{results.length} filtered result{results.length !== 1 ? 's' : ''}</>}
          </p>

          {results.length === 0 ? (
            <div className="text-center pt-14 pb-8">
              <div className="w-14 h-14 rounded-2xl border border-border bg-muted flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No results</h3>
              <p className="text-xs text-muted-foreground">Try different keywords or adjust filters.</p>
            </div>
          ) : (
            results.map((entity) => {
              const boosted = isBoostActive(getBoostState(entity.id));
              const meta = CATEGORY_META[entity.category] ?? DEFAULT_CAT;
              return (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => setSelectedEntityId(entity.id)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-all active:scale-[0.98]"
                >
                  <div className={cx('w-10 h-10 rounded-xl border bg-gradient-to-br flex items-center justify-center flex-shrink-0', meta.color)}>
                    <span className="text-base">{meta.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{entity.name}</h3>
                      {boosted && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 flex-shrink-0">Boosted</span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground line-clamp-1 mt-0.5">{entity.shortDescription}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })
          )}
        </div>
      ) : (
        /* Browse state */
        <div className="px-4 space-y-10 pt-2">
          {/* Trending tags */}
          <section>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Trending Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2.5 mt-4">
              {trendingTags.map((tag, i) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className={cx(
                    'rounded-full border border-border bg-secondary px-3.5 py-1.5 text-sm font-semibold transition-colors',
                    trendingTagColors[i % trendingTagColors.length],
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </section>

          {/* Browse categories */}
          <section>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Browse Categories</h2>
            </div>
            <div className="grid grid-cols-2 gap-3.5 mt-4">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat] ?? DEFAULT_CAT;
                const count = categoryCounts[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategories([cat])}
                    className={cx(
                      'flex items-center gap-4 rounded-2xl border bg-gradient-to-br p-5 text-left transition-all active:scale-[0.97]',
                      meta.color,
                    )}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">{meta.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{cat}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{count} {count === 1 ? 'item' : 'items'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Filter sheet */}
      {filtersMounted && (
        <div className="fixed inset-0 z-50 flex flex-col" onClick={onOverlay} role="presentation">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: filtersVisible ? 1 : 0 }}
          />
          <div
            className="relative mt-auto bg-background rounded-t-2xl max-h-[80vh] flex flex-col border-t border-border transition-transform duration-300 ease-out"
            style={{ transform: filtersVisible ? 'translateY(0)' : 'translateY(100%)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-lg font-bold text-foreground">Filters</h2>
              <button onClick={closeFilters} className="w-8 h-8 flex items-center justify-center rounded-full border border-border bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="mb-8">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Categories</h3>
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {categories.map((c) => (
                    <button key={c} type="button" onClick={() => toggle(selectedCategories, setSelectedCategories, c)}
                      className={cx(
                        'px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                        selectedCategories.includes(c)
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-secondary text-muted-foreground border-border',
                      )}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Tags</h3>
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {tags.slice(0, 25).map((t) => (
                    <button key={t} type="button" onClick={() => toggle(selectedTags, setSelectedTags, t)}
                      className={cx(
                        'px-3 py-1.5 rounded-full text-sm border transition-colors',
                        selectedTags.includes(t)
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-secondary text-muted-foreground border-border',
                      )}>
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <button onClick={resetFilters} className="flex-1 h-11 rounded-xl border border-border bg-muted text-muted-foreground font-semibold text-sm transition-colors active:scale-[0.98]">
                Reset
              </button>
              <button onClick={closeFilters} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-colors active:scale-[0.98]">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entity detail overlay */}
      <EntitySheet entityId={selectedEntityId} onClose={closeEntitySheet} />
    </main>
  );
};

export default SearchHome;
