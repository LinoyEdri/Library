import { Permission } from '@library/shared';
import { RoutePaths } from '../../../constants/route-paths';
import { useCan } from '../../../hooks/useCan';

// "/" opens the dashboard; viewers have no dashboard, so they start at the books catalog
export const useHomeRedirectPath = (): string => {
  const canViewDashboard = useCan(Permission.DASHBOARD_VIEW);

  return canViewDashboard ? RoutePaths.DASHBOARD : RoutePaths.BOOKS;
};
