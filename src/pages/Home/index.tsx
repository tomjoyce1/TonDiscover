import { Navigate } from 'react-router-dom';
import { useAppState } from '@/context/app-context.tsx';

const Home = () => {
  const { hasCompletedOnboarding } = useAppState();
  return <Navigate to={hasCompletedOnboarding ? '/explore' : '/onboarding/welcome'} replace />;
};

export default Home;
