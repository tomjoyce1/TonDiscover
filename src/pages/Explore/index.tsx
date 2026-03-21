import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { DiscoveryTile } from '@/components/discovery/DiscoveryTile.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { useAppState } from '@/context/app-context.tsx';

const Explore = () => {
  const navigate = useNavigate();
  const {
    rankedEntities,
    getBoostState,
    featuredContent,
  } = useAppState();

  const visibleEntities = useMemo(() => rankedEntities, [rankedEntities]);
  const visibleCategories = useMemo(() => {
    return Array.from(new Set(visibleEntities.map((entity) => entity.category))).slice(0, 5);
  }, [visibleEntities]);

  return (
    <div className="min-h-screen bg-tg-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-tg-bg border-b border-tg-border safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold text-tg-primary">Discover</h1>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate('/search')}
            aria-label="Open search"
          >
            <Search className="w-5 h-5 text-tg-muted" />
          </Button>
        </div>
      </header>
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-1">
          {visibleCategories.map((category) => (
            <Chip key={category} size="md" className="whitespace-nowrap">
              {category}
            </Chip>
          ))}
        </div>
        {visibleEntities.length === 0 ? (
          <Card className="mx-3 mt-3" padding="lg">
            <h2 className="text-base font-semibold text-tg-primary">No entities yet</h2>
            <p className="text-sm text-tg-muted mt-2">Try creating one from the post tab, then return to explore.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-3">
            {visibleEntities.map((entity) => (
              <DiscoveryTile
                key={entity.id}
                entity={entity}
                featuredContent={featuredContent.find((item) => item.entityId === entity.id)}
                boostState={getBoostState(entity.id)}
              />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Explore;
