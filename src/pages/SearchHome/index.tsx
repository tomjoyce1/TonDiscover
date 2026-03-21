import { FormEvent, MouseEvent, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const parseList = (value: string | null): string[] => {
  if (!value) {
    return [];
  }
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const encodeList = (items: string[]): string => items.join(',');

const SearchHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userPrefs, entities, categories, saveRecentSearch } = useAppState();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(parseList(searchParams.get('categories')));
  const [selectedTags, setSelectedTags] = useState<string[]>(parseList(searchParams.get('tags')));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const tags = useMemo(() => {
    return Array.from(new Set(entities.flatMap((entity) => entity.tags))).sort((left, right) => {
      return left.localeCompare(right);
    });
  }, [entities]);

  const toggleFilter = (items: string[], setItems: (next: string[]) => void, target: string) => {
    setItems(items.includes(target) ? items.filter((item) => item !== target) : [...items, target]);
  };

  const runSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      saveRecentSearch(trimmedQuery);
    }

    const nextParams = new URLSearchParams();
    if (trimmedQuery) {
      nextParams.set('q', trimmedQuery);
    }
    if (selectedCategories.length) {
      nextParams.set('categories', encodeList(selectedCategories));
    }
    if (selectedTags.length) {
      nextParams.set('tags', encodeList(selectedTags));
    }

    navigate(`/search/results?${nextParams.toString()}`);
  };

  const closeFilters = () => setFiltersOpen(false);

  const onOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeFilters();
    }
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  return (
    <PageShell title="Search" subtitle="Tap the search bar to open filters and #tags.">
      <form className="td-card td-stack" onSubmit={runSearch}>
        <input
          className="td-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFiltersOpen(true)}
          placeholder="Search channels, apps, tags"
        />
        <div className="td-button-row">
          <button type="button" className="td-pill-button" onClick={() => setFiltersOpen(true)}>
            Filters
          </button>
          <button type="submit" className="td-primary-button">Search</button>
        </div>
      </form>

      <section className="td-card td-stack">
        <h2>Recent</h2>
        {userPrefs.recentSearches.length === 0 && <p className="td-muted">No recent searches yet.</p>}
        {userPrefs.recentSearches.map((item) => (
          <button
            key={item}
            type="button"
            className="td-list-link td-list-button"
            onClick={() => navigate(`/search/results?q=${encodeURIComponent(item)}`)}
          >
            {item}
          </button>
        ))}
      </section>

      {filtersOpen && (
        <div className="td-sheet-overlay" onClick={onOverlayClick} role="presentation">
          <section className="td-sheet">
            <div className="td-sheet-header">
              <h2>Filters</h2>
              <button type="button" className="td-pill-button" onClick={closeFilters}>Done</button>
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
              <button type="button" className="td-primary-button" onClick={closeFilters}>Apply</button>
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
};

export default SearchHome;
