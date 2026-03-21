import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
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
        <section className="td-card td-stack">
          <p className="td-muted">Channel or app not found. Add one from Create Hub first.</p>
          <Link to="/create/register" className="td-link-button td-inline-link">Add Channel / App</Link>
        </section>
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
      <section className="td-card td-stack">
        <h2>{entity.name}</h2>
        <p className="td-muted">{entity.shortDescription}</p>
        <p className="td-muted">Type: {entity.type}</p>
        <p className="td-muted">Category: {entity.category}</p>
        <p className="td-muted">Tags: {entity.tags.length > 0 ? entity.tags.join(', ') : 'No tags yet'}</p>
      </section>

      <section className="td-card td-stack">
        <h2>Boost</h2>
        <p className="td-muted">
          Status: {boostActive ? 'Active' : boostState.status}
        </p>
        <p className="td-muted">Remaining: {boostActive ? formatRemainingBoost(boostState.expiresAt) : 'No active boost'}</p>
        <Link to={`/create/boost?entityId=${encodeURIComponent(entity.id)}`} className="td-link-button td-inline-link">
          Open Boost Settings
        </Link>
      </section>

      <form className="td-card td-form" onSubmit={saveSettings}>
        <h2>Settings</h2>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Telegram URL
          <input value={telegramUrl} onChange={(event) => setTelegramUrl(event.target.value)} />
        </label>
        <label>
          Description
          <textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} />
        </label>
        <label>
          Tags (comma separated)
          <input value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
        {saveMessage && <p className="td-muted">{saveMessage}</p>}
        <div className="td-button-row">
          <button type="submit" className="td-primary-button">Save Settings</button>
          <Link to={`/create/post?entityId=${encodeURIComponent(entity.id)}`} className="td-link-button td-inline-link">
            Make Post
          </Link>
        </div>
      </form>
    </PageShell>
  );
};

export default CreateOverview;
