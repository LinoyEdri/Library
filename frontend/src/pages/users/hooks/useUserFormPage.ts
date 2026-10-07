import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../../services/users.api';
import { buildUserDetailsQueryKey } from './useUserDetailsPage';

// "/users/new" creates a user; "/users/:userId/edit" loads the user to edit first
export const useUserFormPage = () => {
  const { userId } = useParams();

  const isEditMode = Boolean(userId);

  const userQuery = useQuery({
    queryKey: buildUserDetailsQueryKey(userId ?? ''),
    queryFn: () => usersApi.getUser(userId ?? ''),
    enabled: isEditMode,
    retry: false,
  });

  return {
    isEditMode,
    editedUser: userQuery.data,
    isLoadingUser: isEditMode && userQuery.isPending,
    loadError: isEditMode ? userQuery.error : null,
    retryLoad: () => userQuery.refetch(),
  };
};
