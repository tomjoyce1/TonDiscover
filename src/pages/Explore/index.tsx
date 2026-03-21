import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { DiscoveryTile } from '@/components/discovery/DiscoveryTile.tsx';
import { EntitySheet } from '@/components/discovery/EntitySheet.tsx';
import { useAppState } from '@/context/app-context.tsx';

const FEED_BATCH_SIZE = 24;

const Explore = () => {
  const { rankedEntities, boosts, featuredContent } = useAppState();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(FEED_BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const closeSheet = useCallback(() => setSelectedEntityId(null), []);
  const featuredByEntityId = useMemo(() => {
    return new Map(featuredContent.map((item) => [item.entityId, item]));
  }, [featuredContent]);
  const visibleEntities = useMemo(() => {
    return rankedEntities.slice(0, visibleCount);
  }, [rankedEntities, visibleCount]);
  const hasMore = visibleCount < rankedEntities.length;

  useEffect(() => {
    setVisibleCount(Math.min(FEED_BATCH_SIZE, rankedEntities.length));
  }, [rankedEntities]);

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        setVisibleCount((currentCount) => Math.min(currentCount + FEED_BATCH_SIZE, rankedEntities.length));
      },
      { root: null, rootMargin: '320px 0px' },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, rankedEntities.length]);

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="bg-background">
        <div className="flex items-center justify-between px-5 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            <span className="text-primary">Ton</span>Discover
          </h1>
          <Link
            to="/search"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Card grid */}
      <section className="px-3">
        {visibleEntities.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">No entities yet</h2>
            <p className="text-xs text-muted-foreground mt-2">Create one from the post tab, then return to explore.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visibleEntities.map((entity) => (
              <DiscoveryTile
                key={entity.id}
                entity={entity}
                featuredContent={featuredByEntityId.get(entity.id)}
                boostState={boosts[entity.id]}
                onSelect={setSelectedEntityId}
              />
            ))}
          </div>
        )}

        {hasMore ? (
          <div ref={loadMoreRef} className="flex justify-center pt-5">
            <button
              type="button"
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground"
              onClick={() => setVisibleCount((currentCount) => Math.min(currentCount + FEED_BATCH_SIZE, rankedEntities.length))}
            >
              Load more
            </button>
          </div>
        ) : null}
      </section>

      <BottomNav />

      {/* Entity detail overlay */}
      <EntitySheet entityId={selectedEntityId} onClose={closeSheet} />
    </main>
  );
};

export default Explore;
