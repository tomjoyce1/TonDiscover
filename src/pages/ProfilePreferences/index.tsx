import { useState } from 'react';
import { Check } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { useAppState } from '@/context/app-context.tsx';

const ProfilePreferences = () => {
  const { categories, userPrefs, completeOnboarding } = useAppState();
  const [selected, setSelected] = useState<string[]>(userPrefs.selectedCategories);
  const [saved, setSaved] = useState(false);

  const toggleCategory = (category: string) => {
    setSaved(false);
    setSelected((previousState) => {
      return previousState.includes(category)
        ? previousState.filter((item) => item !== category)
        : [...previousState, category];
    });
  };

  const save = () => {
    completeOnboarding(selected);
    setSaved(true);
  };

  return (
    <PageShell title="Preferences" backTo="/profile">
      <section className="bg-tg-card border border-tg-border rounded-2xl p-4">
        <h2 className="text-base font-semibold text-tg-primary mb-3">Categories</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selected.includes(category)
                ? 'px-4 py-2 rounded-full text-sm font-medium bg-tg-accent text-white'
                : 'px-4 py-2 rounded-full text-sm font-medium bg-tg-input text-tg-muted'}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <button type="button" className="w-full h-12 bg-tg-accent text-white font-semibold rounded-full inline-flex items-center justify-center gap-2" onClick={save} disabled={selected.length === 0}>
          <Check className="w-4 h-4" />
          Save preferences
        </button>
        {saved && <p className="text-sm text-tg-muted mt-3">Preferences updated.</p>}
      </section>

      <section className="bg-tg-card border border-tg-border rounded-2xl p-4">
        <h2 className="text-base font-semibold text-tg-primary mb-3">Current weights</h2>
        {Object.keys(userPrefs.categoryWeights).length === 0 && <p className="text-sm text-tg-muted">No weights yet.</p>}
        <div className="space-y-1">
          {Object.entries(userPrefs.categoryWeights).map(([category, weight]) => (
            <p key={category} className="text-sm text-tg-muted">{category}: {weight}</p>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default ProfilePreferences;
