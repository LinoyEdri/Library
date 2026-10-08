import { useLocation } from 'react-router';
import { useAuthentication } from '../../../hooks/useAuthentication';

// Decides whether a protected page can render, and where to return after login
export const useRequireAuthentication = () => {
  const {
    currentUser,
    isLoadingCurrentUser,
    isServerUnavailable,
    isRetryingCurrentUser,
    retryLoadingCurrentUser,
  } = useAuthentication();

  const location = useLocation();

  return {
    isLoadingCurrentUser,
    isServerUnavailable,
    isRetryingCurrentUser,
    retryLoadingCurrentUser,
    isLoggedIn: currentUser !== null,
    returnToPath: location.pathname,
  };
};
