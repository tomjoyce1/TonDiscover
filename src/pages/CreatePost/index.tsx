import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';
import type { ContentType } from '@/types/tondiscover.ts';

const DRAFT_KEY = 'tondiscover:create-post-draft';

const CreatePost = () => {
  const navigate = useNavigate();
  const { entities } = useAppState();
  const [entityId, setEntityId] = useState(entities[0]?.id ?? '');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  const selectedEntity = useMemo(
    () => entities.find((entity) => entity.id === entityId),
    [entities, entityId],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!entityId || !title.trim()) {
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

  return (
    <PageShell title="Make Post" backTo="/create">
      <form className="td-card td-form" onSubmit={submit}>
        <label>
          Entity
          <select value={entityId} onChange={(event) => setEntityId(event.target.value)}>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name} · {entity.type}
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
        <button type="submit" className="td-primary-button" disabled={!entityId || !title.trim()}>
          Review / Confirm
        </button>
      </form>
    </PageShell>
  );
};

export default CreatePost;
