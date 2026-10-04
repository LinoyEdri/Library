import { Navigate, Outlet } from 'react-router';
import { RoutePaths } from '../../constants/route-paths';
import { useAuthentication } from '../../hooks/useAuthentication';
import { FullPageLoader } from '../common/FullPageLoader';

// Login and sign-up pages are only for guests; logged-in users go to their home page
export function RedirectIfAuthenticated() {
  const { currentUser, isLoadingCurrentUser } = useAuthentication();

  if (isLoadingCurrentUser) {
    return <FullPageLoader />;
  }

  return currentUser ? <Navigate to={RoutePaths.HOME} replace /> : <Outlet />;
}
