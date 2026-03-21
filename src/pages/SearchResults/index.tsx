import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const parseList = (value: string | null): string[] => {
  if (!value) {
    return [];
  }
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { search } = useAppState();
  const query = searchParams.get('q') ?? '';
  const categories = parseList(searchParams.get('categories'));
  const tags = parseList(searchParams.get('tags'));

  const results = useMemo(() => {
    const base = search(query);
    return base.filter((entity) => {
      const byCategory = categories.length === 0 || categories.includes(entity.category);
      const byTag = tags.length === 0 || entity.tags.some((tag) => tags.includes(tag));
      return byCategory && byTag;
    });
  }, [categories, query, search, tags]);

  return (
    <PageShell title="Search Results" backTo="/search">
      <section className="td-card td-stack">
        <div className="td-sheet-header">
          <h2>Results ({results.length})</h2>
          <button
            type="button"
            className="td-pill-button"
            onClick={() => navigate(`/search?${searchParams.toString()}`)}
          >
            Edit Filters
          </button>
        </div>

        <p className="td-muted">
          Query: {query || 'none'} | Categories: {categories.length ? categories.join(', ') : 'all'} | Tags: {tags.length ? tags.map((item) => `#${item}`).join(', ') : 'all'}
        </p>

        {results.length === 0 && <p className="td-muted">No results for this filter set.</p>}
        {results.map((entity) => (
          <Link key={entity.id} to={`/entity/${entity.id}`} className="td-list-link">
            {entity.name} · {entity.type}
          </Link>
        ))}
      </section>
    </PageShell>
  );
};

export default SearchResults;
