import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ManagedUserResponse, Role } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useNotification } from '../../../hooks/useNotification';
import { usersApi } from '../../../services/users.api';
import { getUserActionErrorMessage } from '../../../utils/get-user-action-error-message';

// Picks a new role and saves it (memberships follow the role on the server)
export const useChangeUserRoleDialog = (user: ManagedUserResponse, onClose: () => void) => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const [selectedRole, setSelectedRole] = useState<Role>(user.role);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const changeRoleMutation = useMutation({
    mutationFn: () => usersApi.changeRole(user.id, selectedRole),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QueryKeys.USERS }),
        queryClient.invalidateQueries({ queryKey: QueryKeys.MEMBERS }),
      ]);

      showNotification(HebrewTexts.users.roleChanged);

      onClose();
    },
    onError: (error) => setErrorMessage(getUserActionErrorMessage(error)),
  });

  const changeSelectedRole = (role: Role) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  return {
    selectedRole,
    changeSelectedRole,
    errorMessage,
    // Saving the current role again would do nothing
    canSave: selectedRole !== user.role,
    saveRole: () => changeRoleMutation.mutate(),
    isSaving: changeRoleMutation.isPending,
  };
};
