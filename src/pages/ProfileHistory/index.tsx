import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink, Eye } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';
import type { Entity } from '@/types/tondiscover.ts';

const CATEGORY_ACCENT: Record<string, string> = {
  DeFi: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Games: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  Tools: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  Community: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Education: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  News: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};
const DEFAULT_ACCENT = 'bg-slate-500/15 text-slate-400 border-slate-500/20';

const CATEGORY_ICONS: Record<string, string> = {
  DeFi: '💱', Games: '🎮', Tools: '🔧', Community: '🌐', Education: '⚡', News: '📰',
};

const EntityRow = ({ entity }: { entity: Entity }) => {
  const accent = CATEGORY_ACCENT[entity.category] ?? DEFAULT_ACCENT;
  const icon = CATEGORY_ICONS[entity.category] ?? '✨';
  return (
    <Link
      to={`/entity/${entity.id}`}
      className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 transition-all active:scale-[0.98]"
    >
      <div className={cx('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border', accent)}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground truncate">{entity.name}</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{entity.shortDescription}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
    </Link>
  );
};

const EmptyState = ({ icon: Icon, text }: { icon: typeof Clock; text: string }) => (
  <div className="rounded-2xl border border-border/50 bg-card/50 py-10 flex flex-col items-center">
    <div className="w-12 h-12 rounded-xl border border-border bg-muted flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

const ProfileHistory = () => {
  const { entities, history } = useAppState();

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

  const totalCount = openedEntities.length + launchedApps.length;

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
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
        {/* Recent Opens */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Recently Viewed</h2>
          </div>
          {openedEntities.length === 0 ? (
            <EmptyState icon={Eye} text="No recently viewed items" />
          ) : (
            <div className="space-y-2.5">
              {openedEntities.map((entity) => (
                <EntityRow key={entity.id} entity={entity} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Launches */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Recently Launched</h2>
          </div>
          {launchedApps.length === 0 ? (
            <EmptyState icon={ExternalLink} text="No launched apps yet" />
          ) : (
            <div className="space-y-2.5">
              {launchedApps.map((entity) => (
                <EntityRow key={entity.id} entity={entity} />
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
};

export default ProfileHistory;
