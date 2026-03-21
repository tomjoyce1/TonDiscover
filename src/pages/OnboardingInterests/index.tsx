import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/app-context.tsx';

const OnboardingInterests = () => {
  const navigate = useNavigate();
  const { categories, completeOnboarding, userPrefs } = useAppState();
  const [selected, setSelected] = useState<string[]>(userPrefs.selectedCategories);

  const toggleCategory = (category: string) => {
    setSelected((previousState) => {
      return previousState.includes(category)
        ? previousState.filter((item) => item !== category)
        : [...previousState, category];
    });
  };

  const finishOnboarding = () => {
    if (!selected.length) {
      return;
    }
    completeOnboarding(selected);
    navigate('/explore');
  };

  return (
    <div className="td-onboarding-screen">
      <div className="td-onboarding-card td-onboarding-card-large">
        <span className="td-onboarding-kicker">Onboarding</span>
        <h1>Choose Interests</h1>
        <p>Pick at least one category. Discovery remains browse-first.</p>
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
        <div className="td-button-row">
          <button
            type="button"
            className="td-pill-button"
            onClick={() => navigate('/onboarding/welcome')}
          >
            Back
          </button>
          <button
            type="button"
            className="td-primary-button"
            onClick={finishOnboarding}
            disabled={!selected.length}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingInterests;
