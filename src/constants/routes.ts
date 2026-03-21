import type { ComponentType } from 'react';
import Home from '@/pages/Home';
import OnboardingWelcome from '@/pages/OnboardingWelcome';
import OnboardingInterests from '@/pages/OnboardingInterests';
import Explore from '@/pages/Explore';
import EntityDetail from '@/pages/EntityDetail';
import Favorites from '@/pages/Favorites';
import SearchHome from '@/pages/SearchHome';
import SearchResults from '@/pages/SearchResults';
import CreateHub from '@/pages/CreateHub';
import CreateRegister from '@/pages/CreateRegister';
import CreatePost from '@/pages/CreatePost';
import CreateReview from '@/pages/CreateReview';
import CreatePublishSuccess from '@/pages/CreatePublishSuccess';
import BoostSettings from '@/pages/BoostSettings';
import BoostConnect from '@/pages/BoostConnect';
import BoostConfirmation from '@/pages/BoostConfirmation';
import BoostSuccess from '@/pages/BoostSuccess';
import Profile from '@/pages/Profile';
import ProfileHistory from '@/pages/ProfileHistory';
import ProfileSettings from '@/pages/ProfileSettings';
import ProfileAccount from '@/pages/ProfileAccount';
import ProfileWallet from '@/pages/ProfileWallet';
import ProfilePreferences from '@/pages/ProfilePreferences';


interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  { path: '/', Component: Home },
  { path: '/onboarding/welcome', Component: OnboardingWelcome },
  { path: '/onboarding/interests', Component: OnboardingInterests },
  { path: '/explore', Component: Explore },
  { path: '/entity/:id', Component: EntityDetail },
  { path: '/search', Component: SearchHome },
  { path: '/search/results', Component: SearchResults },
  { path: '/create', Component: CreateHub },
  { path: '/create/register', Component: CreateRegister },
  { path: '/create/post', Component: CreatePost },
  { path: '/create/review', Component: CreateReview },
  { path: '/create/publish-success', Component: CreatePublishSuccess },
  { path: '/create/boost', Component: BoostSettings },
  { path: '/create/boost/connect', Component: BoostConnect },
  { path: '/create/boost/confirmation', Component: BoostConfirmation },
  { path: '/create/boost/success', Component: BoostSuccess },
  { path: '/profile', Component: Profile },
  { path: '/profile/favorites', Component: Favorites },
  { path: '/profile/history', Component: ProfileHistory },
  { path: '/profile/settings', Component: ProfileSettings },
  { path: '/profile/account', Component: ProfileAccount },
  { path: '/profile/wallet', Component: ProfileWallet },
  { path: '/profile/preferences', Component: ProfilePreferences },
];
