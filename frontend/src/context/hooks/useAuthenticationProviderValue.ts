import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginInput } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { QueryKeys } from '../../constants/query-keys';
import { useNotification } from '../../hooks/useNotification';
import { accessTokenStorage } from '../../services/access-token-storage';
import { setExpiredSessionHandler } from '../../services/api-client';
import { authenticationApi } from '../../services/authentication.api';
import { isServerUnavailableError } from '../../utils/is-server-unavailable-error';
import type { AuthenticationContextValue } from '../authentication-context';

const CURRENT_USER_CACHE_MILLISECONDS = 5 * 60 * 1000;

// Logged-in user state. The user is re-loaded from /auth/me when the page opens.
export const useAuthenticationProviderValue = (): AuthenticationContextValue => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const [hasAccessToken, setHasAccessToken] = useState(() => accessTokenStorage.read() !== null);

  const currentUserQuery = useQuery({
    queryKey: QueryKeys.CURRENT_USER,
    queryFn: authenticationApi.getCurrentUser,
    enabled: hasAccessToken,
    retry: false,
    staleTime: CURRENT_USER_CACHE_MILLISECONDS,
  });

  // Forgets the token and all cached data on this device
  const clearSession = useCallback(() => {
    accessTokenStorage.clear();
    setHasAccessToken(false);
    queryClient.clear();
  }, [queryClient]);

  // User clicked "logout": tell the server (for the audit log), then clear the session.
  // The session is cleared even if the server call fails.
  const logout = useCallback(async () => {
    try {
      await authenticationApi.logout();
    } catch {
      // Logging out must always work locally
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const login = useCallback(
    async (credentials: LoginInput) => {
      const loginResponse = await authenticationApi.login(credentials);

      accessTokenStorage.save(loginResponse.accessToken, loginResponse.expiresAt);
      queryClient.setQueryData(QueryKeys.CURRENT_USER, loginResponse.user);
      setHasAccessToken(true);

      return loginResponse.user;
    },
    [queryClient],
  );

  // A 401 on a logged-in request means the session already ended (expired token or
  // disabled account), so the session is cleared without calling the logout endpoint
  useEffect(() => {
    setExpiredSessionHandler(() => {
      clearSession();
      showNotification(HebrewTexts.authentication.sessionExpired, 'warning');
    });
  }, [clearSession, showNotification]);

  const isServerUnavailable =
    hasAccessToken && !currentUserQuery.data && isServerUnavailableError(currentUserQuery.error);

  const { refetch: refetchCurrentUser } = currentUserQuery;

  const retryLoadingCurrentUser = useCallback(() => {
    void refetchCurrentUser();
  }, [refetchCurrentUser]);

  return useMemo(
    () => ({
      currentUser: hasAccessToken ? (currentUserQuery.data ?? null) : null,
      isLoadingCurrentUser: hasAccessToken && currentUserQuery.isPending,
      login,
      logout,
      endSessionLocally: clearSession,
      isServerUnavailable,
      isRetryingCurrentUser: currentUserQuery.isFetching,
      retryLoadingCurrentUser,
    }),
    [
      hasAccessToken,
      currentUserQuery.data,
      currentUserQuery.isPending,
      currentUserQuery.isFetching,
      login,
      logout,
      clearSession,
      isServerUnavailable,
      retryLoadingCurrentUser,
    ],
  );
};
