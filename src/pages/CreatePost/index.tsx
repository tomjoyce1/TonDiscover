import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Image, Layers, MessageCircle, Sparkles, Type, Video } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';
import { getVideoLinkStatus, isRenderableMediaUrl, normalizeMediaUrl } from '@/helpers/media-url.ts';
import type { ContentType } from '@/types/tondiscover.ts';

const DRAFT_KEY = 'tondiscover:create-post-draft';

const inputClass = 'w-full h-12 px-4 bg-muted/60 text-foreground rounded-xl border border-border/50 outline-none text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors';
const textareaClass = 'w-full p-4 bg-muted/60 text-foreground rounded-xl border border-border/50 outline-none text-sm placeholder:text-muted-foreground resize-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors';

const contentTypes: { value: ContentType; label: string; icon: typeof FileText }[] = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'video', label: 'Video', icon: Video },
];

const CreatePost = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { savedEntities, featuredContent } = useAppState();
  const requestedEntityId = searchParams.get('entityId');
  const requestedPostId = searchParams.get('postId');
  const isEditMode = searchParams.get('edit') === '1';
  const initialEntityId = requestedEntityId && savedEntities.some((e) => e.id === requestedEntityId)
    ? requestedEntityId : savedEntities[0]?.id ?? '';

  const [entityId, setEntityId] = useState(initialEntityId);
  const [contentType, setContentType] = useState<ContentType>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  const selectedEntity = useMemo(() => savedEntities.find((e) => e.id === entityId), [savedEntities, entityId]);
  const normalizedMediaUrl = normalizeMediaUrl(mediaUrl) ?? '';
  const isRenderableMediaInput = isRenderableMediaUrl(normalizedMediaUrl);
  const videoLinkStatus = getVideoLinkStatus(normalizedMediaUrl);
  const editablePost = useMemo(
    () => featuredContent.find((item) => item.id === requestedPostId),
    [featuredContent, requestedPostId],
  );

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    if (editablePost) {
      setEntityId(editablePost.entityId);
    }
    setContentType(editablePost?.contentType ?? 'text');
    setTitle(editablePost?.title ?? '');
    setText(editablePost?.text ?? '');
    setMediaUrl(editablePost?.mediaUrl ?? '');
  }, [editablePost, isEditMode]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!entityId || !selectedEntity || !title.trim()) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
      postId: isEditMode ? editablePost?.id : undefined,
      entityId,
      contentType,
      title: title.trim(),
      text: text.trim(),
      mediaUrl: normalizedMediaUrl,
    }));
    navigate('/create/review');
  };

  if (savedEntities.length === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
        <header className="flex items-center gap-3 px-5 pb-6">
          <Link to="/create" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground" aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Create Post</h1>
        </header>
        <div className="px-4 flex-1 flex flex-col items-center justify-center text-center -mt-10">
          <div className="w-16 h-16 rounded-2xl border border-border bg-card flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-2">No channels yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Register a channel or app first to create posts.</p>
          <Link to="/create/register" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground active:scale-[0.97]">
            <Sparkles className="h-4 w-4" /> Register
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24 pt-6">
      <header className="flex items-center gap-3 px-5 pb-6">
        <Link to="/create" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground" aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{isEditMode ? 'Edit Post' : 'Create Post'}</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {isEditMode ? 'Update featured content' : 'Publish featured content'}
          </p>
        </div>
      </header>

      <form className="px-4 space-y-4" onSubmit={submit}>
        {/* Entity selector */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Channel / App</span>
          </div>
          <div className="space-y-2">
            {savedEntities.map((e) => (
              <button key={e.id} type="button" onClick={() => setEntityId(e.id)}
                className={cx(
                  'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.97]',
                  entityId === e.id ? 'bg-primary/10 border-primary/30 text-foreground' : 'bg-muted/40 border-border/50 text-muted-foreground',
                )}>
                <span className="text-sm font-medium">{e.name}</span>
                <span className="text-[11px] text-muted-foreground ml-auto capitalize">{e.type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content type */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
              <FileText className="h-4 w-4 text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-foreground">Content Type</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {contentTypes.map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setContentType(value)}
                className={cx(
                  'flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[13px] font-medium transition-all active:scale-[0.97]',
                  contentType === value ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-muted/40 border-border/50 text-muted-foreground',
                )}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
              <Type className="h-4 w-4 text-amber-400" />
            </div>
            <label htmlFor="post-title" className="text-sm font-semibold text-foreground">Title</label>
          </div>
          <input id="post-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
        </div>

        {/* Text */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <label htmlFor="post-text" className="text-sm font-semibold text-foreground">Text <span className="text-muted-foreground font-normal">(optional)</span></label>
          </div>
          <textarea id="post-text" className={textareaClass} rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your post content..." />
        </div>

        {/* Media URL */}
        {contentType !== 'text' && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/20">
                <Image className="h-4 w-4 text-rose-400" />
              </div>
              <label htmlFor="post-media" className="text-sm font-semibold text-foreground">Media URL</label>
            </div>
            <input id="post-media" className={inputClass} value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
            {contentType === 'video' ? (
              <div className="mt-2 space-y-1">
                <p className="text-[12px] text-muted-foreground">
                  Use direct video file links (`.mp4`, `.webm`, `.ogg`, `.mov`). Page links won't play.
                </p>
                {mediaUrl.trim() && !isRenderableMediaInput ? (
                  <p className="text-[12px] text-amber-300">
                    This is not a valid media URL. Use `https://...` (or a `/...` local asset path).
                  </p>
                ) : null}
                {mediaUrl.trim() && videoLinkStatus === 'page' ? (
                  <p className="text-[12px] text-amber-300">
                    This looks like a page URL (YouTube/TikTok/etc). Paste a direct file URL instead.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        <button type="submit" disabled={!entityId || !selectedEntity || !title.trim()}
          className="w-full flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-[15px] transition-all active:scale-[0.97] disabled:opacity-40">
          {isEditMode ? 'Review Changes' : 'Review Post'}
        </button>
      </form>

      <BottomNav />
    </main>
  );
};

export default CreatePost;

