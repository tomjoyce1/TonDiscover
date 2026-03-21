import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { Button, buttonStyles } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Input, Select, Textarea } from '@/components/ui/Input.tsx';
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
        <Card>
          <p className="text-sm text-tg-muted mb-4">Add a channel/app first. Posting is available only for your saved channels/apps.</p>
          <Link to="/create/register" className={buttonStyles({ variant: 'primary', size: 'md' })}>Add Channel / App</Link>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Create Post" backTo="/create">
      <Card as="form" className="space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Saved channel / app</span>
          <Select value={entityId} onChange={(event) => setEntityId(event.target.value)}>
            {savedEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name} - {entity.type}
              </option>
            ))}
          </Select>
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Content type</span>
          <Select value={contentType} onChange={(event) => setContentType(event.target.value as ContentType)}>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </Select>
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Title</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Text</span>
          <Textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Media URL</span>
          <Input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} />
        </label>
        <p className="text-xs text-tg-muted">Target: {selectedEntity?.name ?? 'No entity selected'}</p>
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={!entityId || !selectedEntity || !title.trim()}>
          Review Post
        </Button>
      </Card>
    </PageShell>
  );
};

export default CreatePost;
