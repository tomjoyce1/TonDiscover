import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Image, Link2, MessageCircle, Tag, Type } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';
import type { EntityType } from '@/types/tondiscover.ts';

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

const CreateRegister = () => {
  const navigate = useNavigate();
  const { categories, registerEntity } = useAppState();

  const [type, setType] = useState<EntityType>('channel');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'Community');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [previewMediaUrl, setPreviewMediaUrl] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = registerEntity({
      type,
      name: name.trim(),
      category,
      telegramUrl: telegramUrl.trim(),
      shortDescription: shortDescription.trim(),
      tags: tags.split(',').map((v) => v.trim()).filter(Boolean),
      contentType: 'image',
      previewMediaUrl: previewMediaUrl.trim(),
    });

    navigate(`/create?saved=${encodeURIComponent(created.id)}`);
  };

  const isDisabled = !name.trim() || !telegramUrl.trim() || !shortDescription.trim();

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link
          to="/create"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Register</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Add a channel or app to TonDiscover</p>
        </div>
      </header>

      <form className="px-4 space-y-4" onSubmit={handleSubmit}>
        {/* Type picker */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Type</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setType('channel')}
              className={cx(
                'h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
                type === 'channel'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground border border-border/50',
              )}
            >
              Channel
            </button>
            <button
              type="button"
              onClick={() => setType('app')}
              className={cx(
                'h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
                type === 'app'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground border border-border/50',
              )}
            >
              App
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
              <Type className="h-4 w-4 text-violet-400" />
            </div>
            <label htmlFor="reg-name" className="text-sm font-semibold text-foreground">Name</label>
          </div>
          <input
            id="reg-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome channel"
          />
        </div>

        {/* Category */}
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
              const selected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cx(
                    'flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] font-medium transition-all active:scale-[0.97]',
                    selected ? meta.color : 'bg-muted/40 border-border/50 text-muted-foreground',
                  )}
                >
                  <span className="text-base">{meta.icon}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Telegram URL */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/20">
              <Link2 className="h-4 w-4 text-sky-400" />
            </div>
            <label htmlFor="reg-url" className="text-sm font-semibold text-foreground">Telegram URL</label>
          </div>
          <input
            id="reg-url"
            className={inputClass}
            value={telegramUrl}
            onChange={(e) => setTelegramUrl(e.target.value)}
            placeholder="https://t.me/yourchannel"
          />
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
              <MessageCircle className="h-4 w-4 text-amber-400" />
            </div>
            <label htmlFor="reg-desc" className="text-sm font-semibold text-foreground">Description</label>
          </div>
          <textarea
            id="reg-desc"
            className={textareaClass}
            rows={3}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="What does your channel/app do?"
          />
        </div>

        {/* Preview image */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/20">
              <Image className="h-4 w-4 text-rose-400" />
            </div>
            <label htmlFor="reg-img" className="text-sm font-semibold text-foreground">
              Preview image <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
          </div>
          <input
            id="reg-img"
            className={inputClass}
            value={previewMediaUrl}
            onChange={(e) => setPreviewMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Tags */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-500/15 border border-slate-500/20">
              <Tag className="h-4 w-4 text-slate-400" />
            </div>
            <label htmlFor="reg-tags" className="text-sm font-semibold text-foreground">
              Tags <span className="text-muted-foreground font-normal">(comma separated)</span>
            </label>
          </div>
          <input
            id="reg-tags"
            className={inputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="defi, swap, trading"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] transition-all active:scale-[0.97] disabled:opacity-40"
        >
          Register {type === 'app' ? 'App' : 'Channel'}
        </button>
      </form>

      <BottomNav />
    </main>
  );
};

export default CreateRegister;
