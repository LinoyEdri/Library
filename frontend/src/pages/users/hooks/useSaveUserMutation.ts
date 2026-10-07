import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ManagedUserResponse } from '@library/shared';
import { QueryKeys } from '../../../constants/query-keys';
import { useNotification } from '../../../hooks/useNotification';
import { buildUserDetailsPath } from '../../../utils/build-user-paths';

// Shared by the user forms: save, refresh users and members, notify and open the user
export const useSaveUserMutation = <Input>(
  saveUser: (input: Input) => Promise<ManagedUserResponse>,
  successMessage: string,
) => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: saveUser,
    onSuccess: async (savedUser) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QueryKeys.USERS }),
        queryClient.invalidateQueries({ queryKey: QueryKeys.MEMBERS }),
      ]);

      showNotification(successMessage);

      navigate(buildUserDetailsPath(savedUser.id));
    },
  });
};
