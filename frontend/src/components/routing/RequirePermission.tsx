import { Navigate, Outlet } from 'react-router';
import type { Permission } from '@library/shared';
import { RoutePaths } from '../../constants/route-paths';
import { useCan } from '../../hooks/useCan';

// Child routes need at least one of the permissions; otherwise show the 403 page
export function RequirePermission({ permissions }: { permissions: Permission[] }) {
  const isAllowed = useCan(...permissions);

  if (!isAllowed) {
    return (
      <Navigate
        to={RoutePaths.UNAUTHORIZED}
        replace
      />
    );
  }

  return <Outlet />;
}
