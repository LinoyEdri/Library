import { useState } from 'react';
import { useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useNotification } from '../../../hooks/useNotification';
import { usersApi } from '../../../services/users.api';
import { getUserActionErrorMessage } from '../../../utils/get-user-action-error-message';

// Cache key of one user (inside the users key, so list refreshes also refresh it)
export const buildUserDetailsQueryKey = (userId: string) => [...QueryKeys.USERS, 'details', userId];

// Loads the user from the URL; role dialog, disable confirmation and reactivate
export const useUserDetailsPage = () => {
  const { userId = '' } = useParams();

  const queryClient = useQueryClient();

  const { currentUser } = useAuthentication();

  const { showNotification } = useNotification();

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const [isDisableConfirmationOpen, setIsDisableConfirmationOpen] = useState(false);

  const userQuery = useQuery({
    queryKey: buildUserDetailsQueryKey(userId),
    queryFn: () => usersApi.getUser(userId),
    retry: false,
  });

  // Role and status changes may also change memberships
  const refreshUsersAndMembers = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: QueryKeys.USERS }),
      queryClient.invalidateQueries({ queryKey: QueryKeys.MEMBERS }),
    ]);

  const showActionError = (error: unknown) =>
    showNotification(getUserActionErrorMessage(error), 'error');

  const disableMutation = useMutation({
    mutationFn: () => usersApi.disable(userId),
    onSuccess: () => {
      setIsDisableConfirmationOpen(false);
      showNotification(HebrewTexts.users.userDisabled);
      return refreshUsersAndMembers();
    },
    onError: (error) => {
      setIsDisableConfirmationOpen(false);
      showActionError(error);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => usersApi.reactivate(userId),
    onSuccess: () => {
      showNotification(HebrewTexts.users.userReactivated);
      return refreshUsersAndMembers();
    },
    onError: showActionError,
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isPending,
    loadError: userQuery.error,
    retryLoad: () => userQuery.refetch(),
    // Admins cannot change the role or status of their own account
    isOwnAccount: currentUser?.id === userId,
    isRoleDialogOpen,
    openRoleDialog: () => setIsRoleDialogOpen(true),
    closeRoleDialog: () => setIsRoleDialogOpen(false),
    isDisableConfirmationOpen,
    openDisableConfirmation: () => setIsDisableConfirmationOpen(true),
    closeDisableConfirmation: () => setIsDisableConfirmationOpen(false),
    confirmDisable: () => disableMutation.mutate(),
    isDisabling: disableMutation.isPending,
    reactivateUser: () => reactivateMutation.mutate(),
    isReactivating: reactivateMutation.isPending,
  };
};
