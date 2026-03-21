import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { DiscoveryTile } from '@/components/discovery/DiscoveryTile.tsx';
import { EntitySheet } from '@/components/discovery/EntitySheet.tsx';
import { useAppState } from '@/context/app-context.tsx';

const Explore = () => {
  const { rankedEntities, getBoostState, featuredContent } = useAppState();
  const visibleEntities = useMemo(() => rankedEntities, [rankedEntities]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const closeSheet = useCallback(() => setSelectedEntityId(null), []);

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
                featuredContent={featuredContent.find((fc) => fc.entityId === entity.id)}
                boostState={getBoostState(entity.id)}
                onSelect={setSelectedEntityId}
              />
            ))}
          </div>
        )}
      </section>

      <BottomNav />

      {/* Entity detail overlay */}
      <EntitySheet entityId={selectedEntityId} onClose={closeSheet} />
    </main>
  );
};

export default Explore;
