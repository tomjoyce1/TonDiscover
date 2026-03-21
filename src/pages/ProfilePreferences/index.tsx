import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, BarChart3, Layers } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';

const CATEGORY_META: Record<string, { icon: string; accent: string; active: string }> = {
  DeFi:      { icon: '💱', accent: 'border-sky-500/20',      active: 'bg-sky-500/20 border-sky-500/40 text-sky-300' },
  Games:     { icon: '🎮', accent: 'border-violet-500/20',   active: 'bg-violet-500/20 border-violet-500/40 text-violet-300' },
  Tools:     { icon: '🔧', accent: 'border-slate-500/20',    active: 'bg-slate-500/20 border-slate-500/40 text-slate-300' },
  Community: { icon: '🌐', accent: 'border-emerald-500/20',  active: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  Education: { icon: '⚡', accent: 'border-amber-500/20',    active: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  News:      { icon: '📰', accent: 'border-rose-500/20',     active: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
};

const DEFAULT_META = { icon: '✨', accent: 'border-border', active: 'bg-primary/20 border-primary/40 text-primary' };

const ProfilePreferences = () => {
  const { categories, userPrefs, completeOnboarding } = useAppState();
  const [selected, setSelected] = useState<string[]>(userPrefs.selectedCategories);
  const [saved, setSaved] = useState(false);

  const toggleCategory = (category: string) => {
    setSaved(false);
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const save = () => {
    completeOnboarding(selected);
    setSaved(true);
  };

  const weights = Object.entries(userPrefs.categoryWeights);
  const maxWeight = Math.max(...weights.map(([, w]) => w), 1);

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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Feed</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Customize your discovery feed</p>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Category picker */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20">
              <Layers className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Interests</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Select categories you care about</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {categories.map((category) => {
              const meta = CATEGORY_META[category] ?? DEFAULT_META;
              const isSelected = selected.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={cx(
                    'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all active:scale-[0.97]',
                    isSelected
                      ? meta.active
                      : 'bg-muted/40 border-border/50 text-muted-foreground',
                  )}
                >
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-sm font-medium">{category}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={save}
            disabled={selected.length === 0}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save preferences
          </button>

          {saved && (
            <p className="text-center text-[12px] text-emerald-400 mt-3 font-medium">
              ✓ Preferences updated
            </p>
          )}
        </section>

        {/* Weights visualization */}
        {weights.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/20">
                <BarChart3 className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Feed weights</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">How your feed is personalized</p>
              </div>
            </div>

            <div className="space-y-3">
              {weights.map(([category, weight]) => {
                const meta = CATEGORY_META[category] ?? DEFAULT_META;
                const pct = Math.round((weight / maxWeight) * 100);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground font-medium">{category}</span>
                      <span className="text-[11px] text-muted-foreground">{weight}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={cx('h-full rounded-full transition-all', meta.active.split(' ')[0] || 'bg-primary/40')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
};

export default ProfilePreferences;
