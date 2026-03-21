import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { DiscoveryTile } from '@/components/discovery/DiscoveryTile.tsx';
import { useAppState } from '@/context/app-context.tsx';

const Explore = () => {
  const navigate = useNavigate();
  const {
    rankedEntities,
    getBoostState,
    featuredContent,
  } = useAppState();

  const visibleEntities = useMemo(() => rankedEntities, [rankedEntities]);

  return (
    <div className="td-page">
      <header className="td-explore-header">
        <h1>TonDiscover</h1>
        <button
          type="button"
          className="td-icon-button"
          onClick={() => navigate('/search')}
          aria-label="Open search"
        >
          🔍
        </button>
      </header>
      <main className="td-container td-container-with-bottom-nav">
        <div className="td-grid">
          {visibleEntities.map((entity) => (
            <DiscoveryTile
              key={entity.id}
              entity={entity}
              featuredContent={featuredContent.find((item) => item.entityId === entity.id)}
              boostState={getBoostState(entity.id)}
            />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Explore;
