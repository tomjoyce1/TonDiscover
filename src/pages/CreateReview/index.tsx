import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
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
        <Card>
          <p className="text-sm text-tg-muted mb-4">No valid draft found for your saved channels/apps. Create a post first.</p>
          <Button type="button" variant="primary" size="md" onClick={() => navigate('/create/post')}>
            Go to Make Post
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Review / Confirm" backTo="/create/post">
      <Card className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-tg-muted">Entity</span>
          <span className="text-tg-primary">{entity.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tg-muted">Type</span>
          <span className="text-tg-primary uppercase">{draft.contentType}</span>
        </div>
        <div className="pt-2 border-t border-tg-border">
          <p className="text-sm text-tg-muted mb-2">Title</p>
          <p className="text-sm text-tg-primary">{draft.title}</p>
        </div>
        {draft.text && (
          <div>
            <p className="text-sm text-tg-muted mb-2">Text</p>
            <p className="text-sm text-tg-primary whitespace-pre-wrap">{draft.text}</p>
          </div>
        )}
        {draft.mediaUrl && (
          <div>
            <p className="text-sm text-tg-muted mb-2">Media URL</p>
            <p className="text-sm text-tg-primary break-all">{draft.mediaUrl}</p>
          </div>
        )}
        <Button type="button" variant="primary" size="lg" fullWidth onClick={publish}>
          <Check className="w-4 h-4" />
          Publish
        </Button>
      </Card>
    </PageShell>
  );
};

export default CreateReview;
