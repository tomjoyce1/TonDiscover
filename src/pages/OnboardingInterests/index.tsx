import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { cardStyles } from '@/components/ui/Card.tsx';
import { useAppState } from '@/context/app-context.tsx';
import { cx } from '@/helpers/class-name.ts';

const EMOJI_BY_CATEGORY: Record<string, string> = {
  DeFi: '📊',
  Games: '🎮',
  News: '📰',
  Education: '⚡',
  Community: '🌐',
  Tools: '🛠',
};

const OnboardingInterests = () => {
  const navigate = useNavigate();
  const { categories, completeOnboarding, userPrefs } = useAppState();
  const [selected, setSelected] = useState<string[]>(userPrefs.selectedCategories);

  const visualCategories = useMemo(() => {
    return categories.map((category) => ({
      id: category,
      label: category,
      emoji: EMOJI_BY_CATEGORY[category] ?? '✨',
    }));
  }, [categories]);

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
    <div className="min-h-screen bg-tg-bg flex flex-col p-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-tg-primary mb-2">
          Choose Your Interests
        </h1>
        <p className="text-tg-muted mb-8">
          Select at least one category to personalize your feed
        </p>

        <div className="grid grid-cols-2 gap-3">
          {visualCategories.map((category) => {
            const isSelected = selected.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={cx(
                  cardStyles({ variant: 'default', padding: 'md' }),
                  'relative border-2 transition-all text-left',
                  isSelected
                    ? 'border-tg-accent bg-tg-accent/10'
                    : 'border-tg-border',
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-tg-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="text-3xl mb-2 block">{category.emoji}</span>
                <span className="text-sm font-medium text-tg-primary">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={finishOnboarding}
          disabled={!selected.length}
          variant={selected.length ? 'primary' : 'secondary'}
          size="xl"
          fullWidth
          className={!selected.length ? 'text-tg-dim' : undefined}
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button
          type="button"
          variant="text"
          size="md"
          fullWidth
          className="font-medium"
          onClick={() => navigate('/onboarding/welcome')}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default OnboardingInterests;
