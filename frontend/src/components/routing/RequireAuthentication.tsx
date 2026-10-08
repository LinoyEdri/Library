import { Navigate, Outlet } from 'react-router';
import { RoutePaths } from '../../constants/route-paths';
import { FullPageLoader } from '../common/FullPageLoader';
import { ServerUnavailablePage } from '../layout/ServerUnavailablePage';
import { useRequireAuthentication } from './hooks/useRequireAuthentication';

// Child routes need a logged-in user; otherwise go to login and come back afterwards
export function RequireAuthentication() {
  const authenticationState = useRequireAuthentication();

  const { isLoadingCurrentUser, isLoggedIn, returnToPath } = authenticationState;

  if (isLoadingCurrentUser) {
    return <FullPageLoader />;
  }

  // The saved session cannot be checked while the server is down: say so instead of logging out
  if (authenticationState.isServerUnavailable) {
    return (
      <ServerUnavailablePage
        isRetrying={authenticationState.isRetryingCurrentUser}
        onRetry={authenticationState.retryLoadingCurrentUser}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to={RoutePaths.LOGIN}
        replace
        state={{
          returnTo: returnToPath,
        }}
      />
    );
  }

  return <Outlet />;
}
