import { Navigate, Outlet } from 'react-router';
import { RoutePaths } from '../../constants/route-paths';
import { FullPageLoader } from '../common/FullPageLoader';
import { useRequireAuthentication } from './hooks/useRequireAuthentication';

// Child routes need a logged-in user; otherwise go to login and come back afterwards
export function RequireAuthentication() {
  const { isLoadingCurrentUser, isLoggedIn, returnToPath } = useRequireAuthentication();

  if (isLoadingCurrentUser) {
    return <FullPageLoader />;
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
