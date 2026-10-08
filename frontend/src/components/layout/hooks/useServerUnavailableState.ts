import { useSyncExternalStore } from 'react';
import { useIsFetching, useQueryClient, type Query } from '@tanstack/react-query';
import { isServerUnavailableError } from '../../../utils/is-server-unavailable-error';

// A query the open page uses, whose last load failed because the server is unreachable
const isFailedForUnreachableServer = (query: Query) =>
  query.state.status === 'error' && isServerUnavailableError(query.state.error);

const failedQueriesFilter = { type: 'active', predicate: isFailedForUnreachableServer } as const;

// Whether the open page could not load because the server is down, and a retry for its requests
export const useServerUnavailableState = () => {
  const queryClient = useQueryClient();

  const queryCache = queryClient.getQueryCache();

  const isServerUnavailable = useSyncExternalStore(
    (onCacheChange) => queryCache.subscribe(onCacheChange),
    () => queryCache.findAll(failedQueriesFilter).length > 0,
  );

  const isRetrying = useIsFetching(failedQueriesFilter) > 0;

  return {
    isServerUnavailable,
    isRetrying,
    retryFailedRequests: () => queryClient.refetchQueries(failedQueriesFilter),
  };
};
