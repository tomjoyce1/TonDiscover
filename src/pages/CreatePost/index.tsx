import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';
import type { ContentType } from '@/types/tondiscover.ts';

const DRAFT_KEY = 'tondiscover:create-post-draft';

const CreatePost = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { savedEntities } = useAppState();
  const requestedEntityId = searchParams.get('entityId');
  const initialEntityId = requestedEntityId && savedEntities.some((entity) => entity.id === requestedEntityId)
    ? requestedEntityId
    : savedEntities[0]?.id ?? '';
  const [entityId, setEntityId] = useState(initialEntityId);
  const [contentType, setContentType] = useState<ContentType>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  const selectedEntity = useMemo(
    () => savedEntities.find((entity) => entity.id === entityId),
    [savedEntities, entityId],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!entityId || !selectedEntity || !title.trim()) {
      return;
    }

    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
      entityId,
      contentType,
      title: title.trim(),
      text: text.trim(),
      mediaUrl: mediaUrl.trim(),
    }));
    navigate('/create/review');
  };

  if (savedEntities.length === 0) {
    return (
      <PageShell title="Create Post" backTo="/create">
        <section className="td-card td-stack">
          <p className="td-muted">Add a channel/app first. Posting is available only for your saved channels/apps.</p>
          <Link to="/create/register" className="td-primary-button td-inline-link">Add Channel / App</Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="Create Post" backTo="/create">
      <form className="td-card td-form" onSubmit={submit}>
        <label>
          Saved channel / app
          <select value={entityId} onChange={(event) => setEntityId(event.target.value)}>
            {savedEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name} - {entity.type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Content type
          <select value={contentType} onChange={(event) => setContentType(event.target.value as ContentType)}>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Text
          <textarea value={text} onChange={(event) => setText(event.target.value)} />
        </label>
        <label>
          Media URL
          <input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} />
        </label>
        <p className="td-muted">Target: {selectedEntity?.name ?? 'No entity selected'}</p>
        <button type="submit" className="td-primary-button" disabled={!entityId || !selectedEntity || !title.trim()}>
          Review Post
        </button>
      </form>
    </PageShell>
  );
};

export default CreatePost;
