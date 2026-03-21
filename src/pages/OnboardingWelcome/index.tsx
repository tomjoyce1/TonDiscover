import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';

const OnboardingWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-tg-bg flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="w-24 h-24 rounded-full bg-tg-accent/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">T</span>
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
