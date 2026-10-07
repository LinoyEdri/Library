import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '../../../constants/query-keys';
import { settingsApi } from '../../../services/settings.api';

// Loads every setting with its current value
export const useSettingsPage = () => {
  const settingsQuery = useQuery({
    queryKey: QueryKeys.SETTINGS,
    queryFn: settingsApi.list,
  });

  return {
    settings: settingsQuery.data ?? [],
    isLoading: settingsQuery.isPending,
    loadError: settingsQuery.error,
    retryLoad: () => settingsQuery.refetch(),
  };
};
