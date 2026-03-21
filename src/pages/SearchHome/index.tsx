import { MouseEvent, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal, TrendingUp, X } from 'lucide-react';
import { useAppState } from '@/context/app-context.tsx';
import { isBoostActive } from '@/domain/ranking.ts';

const parseList = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const normalize = (value: string): string => value.trim().toLowerCase();

const SearchHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    entities,
    categories,
    rankedEntities,
    featuredContent,
    getBoostState,
  } = useAppState();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(parseList(searchParams.get('categories')));
  const [selectedTags, setSelectedTags] = useState<string[]>(parseList(searchParams.get('tags')));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const featuredByEntityId = useMemo(() => {
    const map = new Map<string, (typeof featuredContent)[number]>();
    featuredContent.forEach((item) => map.set(item.entityId, item));
    return map;
  }, [featuredContent]);

  const tags = useMemo(() => {
    return Array.from(new Set(entities.flatMap((entity) => entity.tags))).sort((left, right) => {
      return left.localeCompare(right);
    });
  }, [entities]);

  const trendingTags = useMemo(() => tags.slice(0, 8), [tags]);

  const toggleFilter = (items: string[], setItems: (next: string[]) => void, target: string) => {
    setItems(items.includes(target) ? items.filter((item) => item !== target) : [...items, target]);
  };

  const filteredBaseResults = useMemo(() => {
    return rankedEntities.filter((entity) => {
      const byCategory = selectedCategories.length === 0 || selectedCategories.includes(entity.category);
      const byTag = selectedTags.length === 0 || entity.tags.some((tag) => selectedTags.includes(tag));
      return byCategory && byTag;
    });
  }, [rankedEntities, selectedCategories, selectedTags]);

  const visibleResults = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
      return filteredBaseResults;
    }

    return filteredBaseResults.filter((entity) => {
      const featured = featuredByEntityId.get(entity.id);
      const fields = [
        entity.name,
        entity.shortDescription,
        entity.longDescription ?? '',
        entity.previewText ?? '',
        featured?.title ?? '',
        featured?.text ?? '',
      ].map(normalize);

      return fields.some((field) => field.includes(normalizedQuery));
    });
  }, [featuredByEntityId, filteredBaseResults, query]);

  const onOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setFiltersOpen(false);
    }
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  const showSearchResults = Boolean(query.trim()) || selectedCategories.length > 0 || selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-tg-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-tg-bg border-b border-tg-border safe-area-top">
        <div className="flex items-center gap-3 h-14 px-4">
          <button onClick={() => navigate('/explore')} className="p-2 -ml-2 rounded-full" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-tg-primary" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tg-muted" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search channels, apps, tags..."
              className="w-full h-10 pl-10 pr-10 bg-tg-input text-tg-primary placeholder:text-tg-dim rounded-full border-none outline-none text-sm"
              autoFocus
            />
            {query && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-tg-muted" />
              </button>
            )}
          </div>
          <button onClick={() => setFiltersOpen(true)} className="p-2 rounded-full bg-tg-input" aria-label="Filters">
            <SlidersHorizontal className="w-5 h-5 text-tg-muted" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {showSearchResults ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-tg-primary">
                {query ? `Results for "${query}"` : 'Filtered results'}
              </h2>
              <span className="text-sm text-tg-muted">{visibleResults.length} found</span>
            </div>

            {visibleResults.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-16 h-16 rounded-full bg-tg-input flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-tg-muted" />
                </div>
                <h3 className="font-medium text-tg-primary mb-2">No results found</h3>
                <p className="text-sm text-tg-muted">Try searching with different keywords.</p>
              </div>
            ) : (
              visibleResults.map((entity) => {
                const boosted = isBoostActive(getBoostState(entity.id));
                return (
                  <button
                    key={entity.id}
                    type="button"
                    onClick={() => navigate(`/entity/${entity.id}`)}
                    className="w-full bg-tg-card border border-tg-border rounded-2xl p-4 flex items-center gap-4 text-left"
                  >
                    <div className="w-14 h-14 rounded-xl bg-tg-input flex items-center justify-center text-xl font-semibold text-tg-primary flex-shrink-0">
                      {entity.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-tg-primary truncate">{entity.name}</h3>
                        {boosted && (
                          <span className="px-2 py-0.5 bg-tg-boost/20 text-tg-boost text-xs rounded-full flex-shrink-0">
                            Boosted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-tg-muted line-clamp-1">{entity.shortDescription}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-tg-dim capitalize">{entity.type}</span>
                        <span className="text-xs text-tg-dim">•</span>
                        <span className="text-xs text-tg-dim capitalize">{entity.category}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-tg-accent" />
                <h2 className="font-semibold text-tg-primary">Trending Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3 py-2 bg-tg-card border border-tg-border rounded-full text-sm text-tg-primary"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-tg-primary mb-3">Browse Categories</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategories([category])}
                    className="p-4 bg-tg-card border border-tg-border rounded-2xl text-left"
                  >
                    <span className="text-sm font-medium text-tg-primary">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" onClick={onOverlayClick} role="presentation">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative mt-auto bg-tg-bg rounded-t-3xl max-h-[85vh] flex flex-col">
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-tg-dim rounded-full" />
            </div>
            <div className="flex items-center justify-between px-4 pb-4">
              <h2 className="text-lg font-semibold text-tg-primary">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-full bg-tg-input">
                <X className="w-5 h-5 text-tg-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-tg-muted mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                      className={selectedCategories.includes(category)
                        ? 'px-4 py-2 rounded-full text-sm font-medium bg-tg-accent text-white'
                        : 'px-4 py-2 rounded-full text-sm font-medium bg-tg-input text-tg-muted'}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-tg-muted mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFilter(selectedTags, setSelectedTags, tag)}
                      className={selectedTags.includes(tag)
                        ? 'px-3 py-1.5 rounded-full text-sm bg-tg-accent text-white'
                        : 'px-3 py-1.5 rounded-full text-sm bg-tg-card text-tg-muted border border-tg-border'}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-tg-border flex gap-2">
              <button onClick={resetFilters} className="flex-1 h-12 bg-tg-input text-tg-muted font-semibold rounded-full">
                Reset
              </button>
              <button onClick={() => setFiltersOpen(false)} className="flex-1 h-12 bg-tg-accent text-white font-semibold rounded-full">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHome;
