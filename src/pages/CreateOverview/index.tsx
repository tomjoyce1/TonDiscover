import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { Button, buttonStyles } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Input, Select, Textarea } from '@/components/ui/Input.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { isBoostActive } from '@/domain/ranking.ts';

const formatRemainingBoost = (expiresAt?: string): string => {
  if (!expiresAt) {
    return 'No active boost';
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return 'Expired';
  }

  const totalMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) {
    return `${minutes}m left`;
  }
  if (minutes === 0) {
    return `${hours}h left`;
  }
  return `${hours}h ${minutes}m left`;
};

const CreateOverview = () => {
  const { id } = useParams<{ id: string }>();
  const { categories, savedEntities, getBoostState, updateSavedEntity } = useAppState();
  const entity = useMemo(
    () => savedEntities.find((item) => item.id === id),
    [savedEntities, id],
  );
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'Community');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!entity) {
      return;
    }

    setName(entity.name);
    setCategory(entity.category);
    setTelegramUrl(entity.telegramUrl);
    setShortDescription(entity.shortDescription);
    setTags(entity.tags.join(', '));
    setSaveMessage('');
  }, [entity]);

  if (!entity) {
    return (
      <PageShell title="Channel Overview" backTo="/create">
        <Card>
          <p className="text-sm text-tg-muted">Channel or app not found. Add one from Create Hub first.</p>
          <Link to="/create/register" className={buttonStyles({ variant: 'primary', size: 'md', className: 'mt-4' })}>
            Add Channel / App
          </Link>
        </Card>
      </PageShell>
    );
  }

  const boostState = getBoostState(entity.id);
  const boostActive = isBoostActive(boostState);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedDescription = shortDescription.trim();
    const normalizedUrl = telegramUrl.trim();

    if (!normalizedName || !normalizedDescription || !normalizedUrl) {
      setSaveMessage('Name, URL, and description are required.');
      return;
    }

    updateSavedEntity(entity.id, {
      name: normalizedName,
      category,
      telegramUrl: normalizedUrl,
      shortDescription: normalizedDescription,
      tags: tags.split(',').map((value) => value.trim()).filter(Boolean),
    });
    setSaveMessage('Settings saved.');
  };

  return (
    <PageShell title="Channel Overview" subtitle="Manage info, boost, and next actions." backTo="/create">
      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-tg-primary">{entity.name}</h2>
        <p className="text-sm text-tg-muted">{entity.shortDescription}</p>
        <p className="text-sm text-tg-muted">Type: {entity.type}</p>
        <p className="text-sm text-tg-muted">Category: {entity.category}</p>
        <p className="text-sm text-tg-muted">Tags: {entity.tags.length > 0 ? entity.tags.join(', ') : 'No tags yet'}</p>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-base font-semibold text-tg-primary">Boost</h2>
        <p className="text-sm text-tg-muted">
          Status: {boostActive ? 'Active' : boostState.status}
        </p>
        <p className="text-sm text-tg-muted">
          Remaining: {boostActive ? formatRemainingBoost(boostState.expiresAt) : 'No active boost'}
        </p>
        <Link to={`/create/boost?entityId=${encodeURIComponent(entity.id)}`} className={buttonStyles({ variant: 'secondary', size: 'md', className: 'mt-2' })}>
          Open Boost Settings
        </Link>
      </Card>

      <Card as="form" className="space-y-4" onSubmit={saveSettings}>
        <h2 className="text-base font-semibold text-tg-primary">Settings</h2>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Category</span>
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Telegram URL</span>
          <Input value={telegramUrl} onChange={(event) => setTelegramUrl(event.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Description</span>
          <Textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Tags (comma separated)</span>
          <Input value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
        {saveMessage && <p className="text-sm text-tg-muted">{saveMessage}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" size="md">Save Settings</Button>
          <Link to={`/create/post?entityId=${encodeURIComponent(entity.id)}`} className={buttonStyles({ variant: 'secondary', size: 'md' })}>
            Make Post
          </Link>
        </div>
      </Card>
    </PageShell>
  );
};

export default CreateOverview;
