import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Input, Select, Textarea } from '@/components/ui/Input.tsx';
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
  const [previewMediaUrl, setPreviewMediaUrl] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = registerEntity({
      type,
      name: name.trim(),
      category,
      telegramUrl: telegramUrl.trim(),
      shortDescription: shortDescription.trim(),
      tags: tags.split(',').map((value) => value.trim()).filter(Boolean),
      contentType: 'image',
      previewMediaUrl: previewMediaUrl.trim(),
    });

    navigate(`/create?saved=${encodeURIComponent(created.id)}`);
  };

  const isDisabled = !name.trim() || !telegramUrl.trim() || !shortDescription.trim() || !previewMediaUrl.trim();

  return (
    <PageShell title="Register Channel / App" subtitle="Save first, then publish post content." backTo="/create">
      <Card as="form" className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Type</span>
          <Select value={type} onChange={(event) => setType(event.target.value as EntityType)}>
            <option value="channel">Channel</option>
            <option value="app">App</option>
          </Select>
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Category</span>
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Telegram URL</span>
          <Input value={telegramUrl} onChange={(event) => setTelegramUrl(event.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Short description</span>
          <Textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} rows={4} />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Preview image URL</span>
          <Textarea
            value={previewMediaUrl}
            onChange={(event) => setPreviewMediaUrl(event.target.value)}
            placeholder="https://..."
            rows={2}
            className="min-h-0 resize-none"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-tg-muted mb-2">Tags (comma separated)</span>
          <Input value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isDisabled}>
          Save channel / app
        </Button>
      </Card>
    </PageShell>
  );
};

export default CreateRegister;
