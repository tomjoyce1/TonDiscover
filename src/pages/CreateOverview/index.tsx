import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Globe, Link2, MessageCircle, Sparkles, Tag, Type, Zap } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { isBoostActive } from '@/domain/ranking.ts';
import { cx } from '@/helpers/class-name.ts';

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  DeFi:      { icon: '💱', color: 'bg-sky-500/20 border-sky-500/40 text-sky-300' },
  Games:     { icon: '🎮', color: 'bg-violet-500/20 border-violet-500/40 text-violet-300' },
  Tools:     { icon: '🔧', color: 'bg-slate-500/20 border-slate-500/40 text-slate-300' },
  Community: { icon: '🌐', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  Education: { icon: '⚡', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  News:      { icon: '📰', color: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
};

const inputClass = 'w-full h-12 px-4 bg-muted/60 text-foreground rounded-xl border border-border/50 outline-none text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors';
const textareaClass = 'w-full p-4 bg-muted/60 text-foreground rounded-xl border border-border/50 outline-none text-sm placeholder:text-muted-foreground resize-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors';

const formatRemaining = (expiresAt?: string): string => {
  if (!expiresAt) return 'No active boost';
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const mins = Math.ceil(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m left`;
  return m === 0 ? `${h}h left` : `${h}h ${m}m left`;
};

const CreateOverview = () => {
  const { id } = useParams<{ id: string }>();
  const { categories, savedEntities, getBoostState, updateSavedEntity } = useAppState();
  const entity = useMemo(() => savedEntities.find((e) => e.id === id), [savedEntities, id]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'Community');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!entity) return;
    setName(entity.name);
    setCategory(entity.category);
    setTelegramUrl(entity.telegramUrl);
    setShortDescription(entity.shortDescription);
    setTags(entity.tags.join(', '));
    setSaved(false);
  }, [entity]);

  if (!entity) {
    return (
      <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
        <header className="flex items-center gap-3 px-5 pb-6">
          <Link to="/create" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground" aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Overview</h1>
        </header>
        <div className="px-4 flex-1 flex flex-col items-center justify-center text-center -mt-10">
          <div className="w-16 h-16 rounded-2xl border border-border bg-card flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-2">Entity not found</h2>
          <p className="text-sm text-muted-foreground mb-6">Register a channel or app first.</p>
          <Link to="/create/register" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground active:scale-[0.97]">
            <Sparkles className="h-4 w-4" /> Register
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  const boostState = getBoostState(entity.id);
  const boosted = isBoostActive(boostState);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !shortDescription.trim() || !telegramUrl.trim()) return;
    updateSavedEntity(entity.id, {
      name: name.trim(), category, telegramUrl: telegramUrl.trim(),
      shortDescription: shortDescription.trim(),
      tags: tags.split(',').map((v) => v.trim()).filter(Boolean),
    });
    setSaved(true);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link to="/create" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground" aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Manage {entity.name}</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Info summary */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{CATEGORY_META[entity.category]?.icon ?? '✨'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground truncate">{entity.name}</h2>
              <p className="text-[12px] text-muted-foreground capitalize mt-0.5">{entity.type} · {entity.category}</p>
            </div>
          </div>
        </div>

        {/* Boost status */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Boost</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {boosted ? formatRemaining(boostState.expiresAt) : 'Inactive'}
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Link
              to={`/create/boost?entityId=${encodeURIComponent(entity.id)}`}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-amber-500/10 text-amber-300 font-semibold text-sm transition-all active:scale-[0.97]"
            >
              <Zap className="w-4 h-4" />
              {boosted ? 'Extend Boost' : 'Boost'}
            </Link>
            <Link
              to={`/create/post?entityId=${encodeURIComponent(entity.id)}`}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-primary/10 text-primary font-semibold text-sm transition-all active:scale-[0.97]"
            >
              <MessageCircle className="w-4 h-4" />
              Post
            </Link>
          </div>
        </div>

        {/* Edit form */}
        <form className="space-y-4" onSubmit={saveSettings}>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
                <Type className="h-4 w-4 text-violet-400" />
              </div>
              <label htmlFor="ov-name" className="text-sm font-semibold text-foreground">Name</label>
            </div>
            <input id="ov-name" className={inputClass} value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                <Globe className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-foreground">Category</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat] ?? { icon: '✨', color: 'bg-muted border-border text-muted-foreground' };
                return (
                  <button key={cat} type="button" onClick={() => { setCategory(cat); setSaved(false); }}
                    className={cx(
                      'flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] font-medium transition-all active:scale-[0.97]',
                      category === cat ? meta.color : 'bg-muted/40 border-border/50 text-muted-foreground',
                    )}>
                    <span className="text-base">{meta.icon}</span>{cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/20">
                <Link2 className="h-4 w-4 text-sky-400" />
              </div>
              <label htmlFor="ov-url" className="text-sm font-semibold text-foreground">Telegram URL</label>
            </div>
            <input id="ov-url" className={inputClass} value={telegramUrl} onChange={(e) => { setTelegramUrl(e.target.value); setSaved(false); }} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
                <MessageCircle className="h-4 w-4 text-amber-400" />
              </div>
              <label htmlFor="ov-desc" className="text-sm font-semibold text-foreground">Description</label>
            </div>
            <textarea id="ov-desc" className={textareaClass} rows={3} value={shortDescription} onChange={(e) => { setShortDescription(e.target.value); setSaved(false); }} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-500/15 border border-slate-500/20">
                <Tag className="h-4 w-4 text-slate-400" />
              </div>
              <label htmlFor="ov-tags" className="text-sm font-semibold text-foreground">Tags <span className="text-muted-foreground font-normal">(comma separated)</span></label>
            </div>
            <input id="ov-tags" className={inputClass} value={tags} onChange={(e) => { setTags(e.target.value); setSaved(false); }} />
          </div>

          <button type="submit"
            className="w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] transition-all active:scale-[0.97]">
            <CheckCircle2 className="w-4 h-4" />
            Save Settings
          </button>

          {saved && (
            <p className="text-center text-[12px] text-emerald-400 font-medium">✓ Settings saved</p>
          )}
        </form>
      </div>

      <BottomNav />
    </main>
  );
};

export default CreateOverview;
