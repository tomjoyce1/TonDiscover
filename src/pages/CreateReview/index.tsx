import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const DRAFT_KEY = 'tondiscover:create-post-draft';

type Draft = {
  entityId: string;
  contentType: 'text' | 'image' | 'video';
  title: string;
  text: string;
  mediaUrl: string;
};

const readDraft = (): Draft | null => {
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
};

const CreateReview = () => {
  const navigate = useNavigate();
  const { savedEntities, setFeaturedContent } = useAppState();
  const draft = useMemo(readDraft, []);
  const entity = savedEntities.find((item) => item.id === draft?.entityId);

  const publish = () => {
    if (!draft || !entity) {
      return;
    }

    setFeaturedContent({
      entityId: draft.entityId,
      mode: 'manual',
      contentType: draft.contentType,
      title: draft.title,
      text: draft.text || undefined,
      mediaUrl: draft.mediaUrl || undefined,
    });
    window.localStorage.removeItem(DRAFT_KEY);
    navigate(`/create/publish-success?entityId=${encodeURIComponent(entity.id)}`);
  };

  if (!draft || !entity) {
    return (
      <PageShell title="Review / Confirm" backTo="/create/post">
        <section className="td-card td-stack">
          <p className="td-muted">No valid draft found for your saved channels/apps. Create a post first.</p>
          <button type="button" className="td-primary-button" onClick={() => navigate('/create/post')}>
            Go to Make Post
          </button>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell title="Review / Confirm" backTo="/create/post">
      <section className="td-card td-stack">
        <p><strong>Entity:</strong> {entity.name}</p>
        <p><strong>Type:</strong> {draft.contentType}</p>
        <p><strong>Title:</strong> {draft.title}</p>
        {draft.text && <p><strong>Text:</strong> {draft.text}</p>}
        {draft.mediaUrl && <p><strong>Media:</strong> {draft.mediaUrl}</p>}
        <button type="button" className="td-primary-button" onClick={publish}>
          Publish
        </button>
      </section>
    </PageShell>
  );
};

export default CreateReview;
