import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, FileText, Globe, Image, Link2, MessageCircle,
  Sparkles, Tag, Trash2, Type, Zap,
} from 'lucide-react';
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

type Tab = 'entities' | 'posts';

const formatRemaining = (expiresAt?: string): string => {
  if (!expiresAt) return '';
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
  const {
    categories, savedEntities, featuredContent, getBoostState,
    deleteEntity, deleteFeaturedContent, updateSavedEntity,
  } = useAppState();

  const [tab, setTab] = useState<Tab>('entities');
  const [editingId, setEditingId] = useState<string | null>(id ?? null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const entity = useMemo(
    () => savedEntities.find((e) => e.id === editingId),
    [savedEntities, editingId],
  );

  // Posts for owned entities
  const ownedPosts = useMemo(() => {
    const ownedIds = new Set(savedEntities.map((e) => e.id));
    return featuredContent.filter((fc) => ownedIds.has(fc.entityId));
  }, [savedEntities, featuredContent]);

  // Edit form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'Community');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [previewMediaUrl, setPreviewMediaUrl] = useState('');
  const [saved, setSaved] = useState(false);

  const entityId = entity?.id;
  useEffect(() => {
    if (!entity) return;
    setName(entity.name);
    setCategory(entity.category);
    setTelegramUrl(entity.telegramUrl);
    setShortDescription(entity.shortDescription);
    setTags(entity.tags.join(', '));
    setPreviewMediaUrl(entity.previewMediaUrl ?? '');
    setSaved(false);
    // Only re-sync when switching to a different entity, not on every entity object change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId]);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!entity || !name.trim() || !shortDescription.trim() || !telegramUrl.trim()) return;
    updateSavedEntity(entity.id, {
      name: name.trim(), category, telegramUrl: telegramUrl.trim(),
      shortDescription: shortDescription.trim(),
      tags: tags.split(',').map((v) => v.trim()).filter(Boolean),
      previewMediaUrl: previewMediaUrl.trim(),
    });
    setSaved(true);
  };

  const handleDeleteEntity = (entityId: string) => {
    deleteEntity(entityId);
    setConfirmDeleteId(null);
    if (editingId === entityId) setEditingId(null);
  };

  const handleDeletePost = (postId: string) => {
    deleteFeaturedContent(postId);
    setConfirmDeleteId(null);
  };

  // If editing a specific entity, show the edit form
  if (editingId && entity) {
    const boostState = getBoostState(entity.id);
    const boosted = isBoostActive(boostState);

    return (
      <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
        <header className="flex items-center gap-3 px-5 pb-6">
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Edit</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">{entity.name}</p>
          </div>
        </header>

        <div className="px-4 space-y-4">
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
                {boosted ? 'Extend' : 'Boost'}
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

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/20">
                  <Image className="h-4 w-4 text-rose-400" />
                </div>
                <label htmlFor="ov-img" className="text-sm font-semibold text-foreground">
                  Preview image <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
              </div>
              <input id="ov-img" className={inputClass} value={previewMediaUrl} onChange={(e) => { setPreviewMediaUrl(e.target.value); setSaved(false); }} placeholder="https://example.com/image.jpg" />
            </div>

            <button type="submit"
              className={cx(
                'w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl font-bold text-[15px] transition-all active:scale-[0.97]',
                saved
                  ? 'bg-emerald-500 text-black'
                  : 'bg-primary text-primary-foreground',
              )}>
              <CheckCircle2 className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </form>
        </div>

        <BottomNav />
      </main>
    );
  }

  // Main list view with tabs
  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/create"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Manage</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Your channels, apps & posts</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setTab('entities')}
            className={cx(
              'h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
              tab === 'entities'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground border border-border/50',
            )}
          >
            Channels & Apps
          </button>
          <button
            type="button"
            onClick={() => setTab('posts')}
            className={cx(
              'h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
              tab === 'posts'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground border border-border/50',
            )}
          >
            Posts
          </button>
        </div>

        {/* Entities list */}
        {tab === 'entities' && (
          <div className="space-y-3">
            {savedEntities.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">No channels or apps yet</p>
                <Link
                  to="/create/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground active:scale-[0.97]"
                >
                  <Sparkles className="h-4 w-4" /> Register
                </Link>
              </div>
            ) : (
              savedEntities.map((e) => {
                const meta = CATEGORY_META[e.category] ?? { icon: '✨' };
                const boostState = getBoostState(e.id);
                const boosted = isBoostActive(boostState);
                const isConfirming = confirmDeleteId === `entity-${e.id}`;

                return (
                  <div key={e.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(e.id)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        {e.previewMediaUrl ? (
                          <img src={e.previewMediaUrl} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{meta.icon}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">{e.name}</h3>
                          <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                            {e.type} · {e.category}
                            {boosted && <span className="text-amber-400 ml-1">· Boosted</span>}
                          </p>
                        </div>
                      </button>
                      {isConfirming ? (
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDeleteEntity(e.id)}
                            className="h-9 px-3 rounded-lg bg-rose-500/15 text-rose-400 text-xs font-semibold active:scale-[0.95]"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-9 px-3 rounded-lg bg-muted text-muted-foreground text-xs font-semibold active:scale-[0.95]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(`entity-${e.id}`)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-rose-400 transition-colors flex-shrink-0"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Posts list */}
        {tab === 'posts' && (
          <div className="space-y-3">
            {ownedPosts.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">No posts yet</p>
                {savedEntities.length > 0 && (
                  <Link
                    to="/create/post"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground active:scale-[0.97]"
                  >
                    <FileText className="h-4 w-4" /> Create Post
                  </Link>
                )}
              </div>
            ) : (
              ownedPosts.map((post) => {
                const parentEntity = savedEntities.find((e) => e.id === post.entityId);
                const postBoostState = getBoostState(post.id);
                const parentBoostState = getBoostState(post.entityId);
                const hasActivePostBoost = isBoostActive(postBoostState);
                const postBoosted = hasActivePostBoost || isBoostActive(parentBoostState);
                const isConfirming = confirmDeleteId === `post-${post.id}`;
                const editHref = `/create/post?postId=${encodeURIComponent(post.id)}&edit=1`;

                return (
                  <div key={post.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <Link to={editHref} className="flex items-center gap-3 flex-1 min-w-0 text-left active:scale-[0.99]">
                        <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {post.title || 'Untitled post'}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {parentEntity?.name ?? 'Unknown entity'} · {post.mode}
                            {postBoosted && <span className="text-amber-400 ml-1">· Boosted</span>}
                          </p>
                        </div>
                      </Link>
                      {isConfirming ? (
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="h-9 px-3 rounded-lg bg-rose-500/15 text-rose-400 text-xs font-semibold active:scale-[0.95]"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-9 px-3 rounded-lg bg-muted text-muted-foreground text-xs font-semibold active:scale-[0.95]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(`post-${post.id}`)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-rose-400 transition-colors"
                          aria-label="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
};

export default CreateOverview;
