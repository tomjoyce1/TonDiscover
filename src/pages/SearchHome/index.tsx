import { MouseEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DiscoveryTile } from '@/components/discovery/DiscoveryTile.tsx';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const parseList = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const normalize = (value: string): string => value.trim().toLowerCase();

const SearchHome = () => {
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

  return (
    <PageShell title="Search" subtitle="Type to see relevant posts instantly. Tags are separate filters." backTo="/explore">
      <section className="td-card td-stack">
        <div className="td-search-row">
          <input
            className="td-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts, channels, apps..."
          />
          <button type="button" className="td-pill-button" onClick={() => setFiltersOpen(true)}>
            Filters
          </button>
        </div>
        <p className="td-muted">
          Results: {visibleResults.length} | Categories: {selectedCategories.length || 'all'} | Tags: {selectedTags.length || 'all'}
        </p>
      </section>

      <div className="td-grid">
        {visibleResults.map((entity) => (
          <DiscoveryTile
            key={entity.id}
            entity={entity}
            featuredContent={featuredByEntityId.get(entity.id)}
            boostState={getBoostState(entity.id)}
          />
        ))}
      </div>

      {filtersOpen && (
        <div className="td-sheet-overlay" onClick={onOverlayClick} role="presentation">
          <section className="td-sheet">
            <div className="td-sheet-header">
              <h2>Filters</h2>
              <button type="button" className="td-pill-button" onClick={() => setFiltersOpen(false)}>Done</button>
            </div>

            <div className="td-stack">
              <h3 className="td-sheet-title">Categories</h3>
              <div className="td-chip-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={selectedCategories.includes(category) ? 'td-chip td-chip-active' : 'td-chip'}
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="td-stack">
              <h3 className="td-sheet-title">Tags</h3>
              <div className="td-chip-wrap">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={selectedTags.includes(tag) ? 'td-chip td-chip-active' : 'td-chip'}
                    onClick={() => toggleFilter(selectedTags, setSelectedTags, tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="td-button-row">
              <button type="button" className="td-pill-button" onClick={resetFilters}>Reset</button>
              <button type="button" className="td-primary-button" onClick={() => setFiltersOpen(false)}>Apply</button>
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
};

export default SearchHome;
