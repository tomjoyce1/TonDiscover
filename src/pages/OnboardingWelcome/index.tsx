import { useNavigate } from 'react-router-dom';

const OnboardingWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="td-onboarding-screen">
      <div className="td-onboarding-card">
        <span className="td-onboarding-kicker">TonDiscover</span>
        <h1>Welcome</h1>
        <p>Discover channels and apps fast. Boost what matters later.</p>
        <button
          type="button"
          className="td-primary-button"
          onClick={() => navigate('/onboarding/interests')}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
