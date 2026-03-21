import { Link, useSearchParams } from 'react-router-dom';
import { Boxes, FileText, MessageCircle, Rocket, Sparkles } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';

const CreateHub = () => {
  const [searchParams] = useSearchParams();
  const { savedEntities } = useAppState();
  const hasSavedEntities = savedEntities.length > 0;
  const defaultOverviewEntityId = savedEntities[0]?.id ?? '';
  const savedEntityId = searchParams.get('saved');
  const savedEntity = savedEntities.find((entity) => entity.id === savedEntityId);

  const actions = [
    {
      to: '/create/register',
      icon: MessageCircle,
      label: 'Register',
      description: 'Add a channel or app',
      accent: 'bg-primary/15 text-primary',
      enabled: true,
    },
    {
      to: hasSavedEntities ? `/create/overview/${encodeURIComponent(defaultOverviewEntityId)}` : '#',
      icon: Boxes,
      label: 'Overview',
      description: hasSavedEntities ? 'Manage your entities' : 'Register first',
      accent: 'bg-emerald-500/15 text-emerald-400',
      enabled: hasSavedEntities,
    },
    {
      to: hasSavedEntities ? '/create/post' : '#',
      icon: FileText,
      label: 'Post',
      description: hasSavedEntities ? 'Publish featured content' : 'Register first',
      accent: 'bg-violet-500/15 text-violet-400',
      enabled: hasSavedEntities,
    },
    {
      to: '/create/boost',
      icon: Rocket,
      label: 'Boost',
      description: 'Increase visibility',
      accent: 'bg-amber-500/15 text-amber-400',
      enabled: true,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="px-5 pb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          <span className="text-primary">Create</span>
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">Register your channel, publish posts, or boost visibility.</p>
      </header>

      {/* Success banner */}
      {savedEntity && (
        <div className="mx-4 mb-5 flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-300">
            Saved <span className="font-semibold text-white">{savedEntity.name}</span> — create a post for it now.
          </p>
        </div>
      )}

      {/* Action grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {actions.map(({ to, icon: Icon, label, description, accent, enabled }) => {
          const content = (
            <div className={cx(
              'flex flex-col items-center text-center rounded-2xl border border-border bg-card p-6 transition-all',
              enabled ? 'active:scale-[0.97]' : 'opacity-40',
            )}>
              <div className={cx('w-14 h-14 rounded-2xl flex items-center justify-center mb-4', accent)}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-[15px] font-bold text-foreground mb-1">{label}</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>
            </div>
          );

          return enabled ? (
            <Link key={label} to={to}>{content}</Link>
          ) : (
            <div key={label}>{content}</div>
          );
        })}
      </div>

      <BottomNav />
    </main>
  );
};

export default CreateHub;
