import { useState } from 'react';
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
      <section className="td-card td-stack">
        <h2>Categories</h2>
        <div className="td-chip-wrap">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selected.includes(category) ? 'td-chip td-chip-active' : 'td-chip'}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <button type="button" className="td-primary-button" onClick={save} disabled={selected.length === 0}>
          Save preferences
        </button>
        {saved && <p className="td-muted">Preferences updated.</p>}
      </section>
      <section className="td-card td-stack">
        <h2>Current weights</h2>
        {Object.keys(userPrefs.categoryWeights).length === 0 && <p className="td-muted">No weights yet.</p>}
        {Object.entries(userPrefs.categoryWeights).map(([category, weight]) => (
          <p key={category} className="td-muted">{category}: {weight}</p>
        ))}
      </section>
    </PageShell>
  );
};

export default ProfilePreferences;
