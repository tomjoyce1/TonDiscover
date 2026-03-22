import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink, Eye } from 'lucide-react';
import { DiscoveryTile } from '@/components/discovery/DiscoveryTile.tsx';
import { EntitySheet } from '@/components/discovery/EntitySheet.tsx';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import type { Entity } from '@/types/tondiscover.ts';

const EmptyState = ({ icon: Icon, text }: { icon: typeof Clock; text: string }) => (
  <div className="rounded-2xl border border-border/50 bg-card/50 py-10 flex flex-col items-center">
    <div className="w-12 h-12 rounded-xl border border-border bg-muted flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

const ProfileHistory = () => {
  const { entities, history, featuredContent, boosts } = useAppState();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const closeSheet = useCallback(() => setSelectedEntityId(null), []);

  const openedEntities = useMemo(
    () => history.recentOpenedEntityIds
      .map((id) => entities.find((e) => e.id === id))
      .filter((e): e is Entity => e !== undefined),
    [entities, history.recentOpenedEntityIds],
  );

  const launchedApps = useMemo(
    () => history.recentLaunchedAppIds
      .map((id) => entities.find((e) => e.id === id))
      .filter((e): e is Entity => e !== undefined),
    [entities, history.recentLaunchedAppIds],
  );

  const featuredByEntityId = useMemo(() => {
    return new Map(featuredContent.map((item) => [item.entityId, item]));
  }, [featuredContent]);

  const totalCount = openedEntities.length + launchedApps.length;

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/profile"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">History</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {totalCount} recent {totalCount === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      </header>

      <div className="px-4 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Recently Viewed</h2>
          </div>
          {openedEntities.length === 0 ? (
            <EmptyState icon={Eye} text="No recently viewed items" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {openedEntities.map((entity) => (
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
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Recently Launched</h2>
          </div>
          {launchedApps.length === 0 ? (
            <EmptyState icon={ExternalLink} text="No launched apps yet" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {launchedApps.map((entity) => (
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
        </section>
      </div>

      <BottomNav />
      <EntitySheet entityId={selectedEntityId} onClose={closeSheet} />
    </main>
  );
};

export default ProfileHistory;
