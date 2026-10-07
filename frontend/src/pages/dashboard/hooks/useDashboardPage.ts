import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '../../../constants/query-keys';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { dashboardApi } from '../../../services/dashboard.api';

// Loads the dashboard of the user's role (fresh on every visit)
export const useDashboardPage = () => {
  const { currentUser } = useAuthentication();

  const dashboardQuery = useQuery({
    queryKey: QueryKeys.DASHBOARD,
    queryFn: dashboardApi.get,
  });

  return {
    firstName: currentUser?.firstName ?? '',
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isPending,
    loadError: dashboardQuery.error,
    retryLoad: () => dashboardQuery.refetch(),
  };
};
