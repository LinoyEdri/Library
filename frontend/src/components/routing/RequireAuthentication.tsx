import { Navigate, Outlet, useLocation } from 'react-router';
import { RoutePaths } from '../../constants/route-paths';
import { useAuthentication } from '../../hooks/useAuthentication';
import { FullPageLoader } from '../common/FullPageLoader';

// Child routes need a logged-in user; otherwise go to login and come back afterwards
export function RequireAuthentication() {
  const { currentUser, isLoadingCurrentUser } = useAuthentication();

  const location = useLocation();

  if (isLoadingCurrentUser) {
    return <FullPageLoader />;
  }

  if (!currentUser) {
    return <Navigate to={RoutePaths.LOGIN} replace state={{ returnTo: location.pathname }} />;
  }

  return <Outlet />;
}
