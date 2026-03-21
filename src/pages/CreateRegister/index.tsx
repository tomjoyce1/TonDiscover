import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';
import type { EntityType } from '@/types/tondiscover.ts';

const CreateRegister = () => {
  const navigate = useNavigate();
  const { categories, registerEntity } = useAppState();

  const [type, setType] = useState<EntityType>('channel');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'Community');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = registerEntity({
      type,
      name: name.trim(),
      category,
      telegramUrl: telegramUrl.trim(),
      shortDescription: shortDescription.trim(),
      tags: tags.split(',').map((value) => value.trim()).filter(Boolean),
      contentType: 'text',
    });

    navigate(`/create?saved=${encodeURIComponent(created.id)}`);
  };

  const isDisabled = !name.trim() || !telegramUrl.trim() || !shortDescription.trim();

  return (
    <PageShell title="Register Channel / App" subtitle="Adding a channel/app only saves it. Posting is a separate step." backTo="/create">
      <form className="td-card td-form" onSubmit={handleSubmit}>
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value as EntityType)}>
            <option value="channel">Channel</option>
            <option value="app">App</option>
          </select>
        </label>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Telegram URL
          <input value={telegramUrl} onChange={(event) => setTelegramUrl(event.target.value)} />
        </label>
        <label>
          Short description
          <textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} />
        </label>
        <label>
          Tags (comma separated)
          <input value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
        <button type="submit" className="td-primary-button" disabled={isDisabled}>
          Save channel / app
        </button>
      </form>
    </PageShell>
  );
};

export default CreateRegister;
