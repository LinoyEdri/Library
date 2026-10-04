import { useLocation } from 'react-router';
import { useAuthentication } from '../../../hooks/useAuthentication';

// Decides whether a protected page can render, and where to return after login
export const useRequireAuthentication = () => {
  const { currentUser, isLoadingCurrentUser } = useAuthentication();

  const location = useLocation();

  return {
    isLoadingCurrentUser,
    isLoggedIn: currentUser !== null,
    returnToPath: location.pathname,
  };
};
