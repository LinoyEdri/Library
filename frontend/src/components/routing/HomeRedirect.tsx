import { Navigate } from 'react-router';
import { Permission } from '@library/shared';
import { RoutePaths } from '../../constants/route-paths';
import { useCan } from '../../hooks/useCan';

// "/" opens the dashboard; viewers have no dashboard, so they start at the books catalog
export function HomeRedirect() {
  const canViewDashboard = useCan(Permission.DASHBOARD_VIEW);

  return <Navigate to={canViewDashboard ? RoutePaths.DASHBOARD : RoutePaths.BOOKS} replace />;
}
