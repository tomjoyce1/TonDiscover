import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';

const OnboardingWelcome = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(42,171,238,0.08) 0%, var(--tg-bg) 70%)' }}
    >
      <div className="text-center mb-12">
        <div className="w-28 h-28 rounded-full bg-tg-accent/15 border border-tg-accent/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-bold text-tg-accent">T</span>
        </div>
        <h1 className="text-2xl font-bold text-tg-primary mb-3">
          Welcome to TONDiscover
        </h1>
        <p className="text-tg-muted leading-relaxed">
          Discover channels and mini apps in one visual feed.
          Boost what matters when you are ready.
        </p>
      </div>

      <Button
        variant="primary"
        size="xl"
        fullWidth
        onClick={() => navigate('/onboarding/interests')}
        className="max-w-sm"
      >
        Get Started
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default OnboardingWelcome;
