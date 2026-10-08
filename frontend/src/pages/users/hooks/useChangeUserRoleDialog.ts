import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Role, type ManagedUserResponse } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useNotification } from '../../../hooks/useNotification';
import { usersApi } from '../../../services/users.api';
import { getUserActionErrorMessage } from '../../../utils/get-user-action-error-message';
import { useEndSessionAfterAdminHandover } from './useEndSessionAfterAdminHandover';

// Picks a new role and saves it (memberships follow the role on the server).
// Choosing ADMIN hands the admin role over, so it asks for confirmation first.
export const useChangeUserRoleDialog = (user: ManagedUserResponse, onClose: () => void) => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const endSessionAfterAdminHandover = useEndSessionAfterAdminHandover();

  const [selectedRole, setSelectedRole] = useState<Role>(user.role);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isAdminHandoverWarningOpen, setIsAdminHandoverWarningOpen] = useState(false);

  const isAdminHandover = selectedRole === Role.ADMIN;

  const changeRoleMutation = useMutation({
    mutationFn: () => usersApi.changeRole(user.id, selectedRole),
    onSuccess: async () => {
      // This account is no longer the admin (and is disabled): nothing else to refresh
      if (isAdminHandover) {
        endSessionAfterAdminHandover();
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QueryKeys.USERS }),
        queryClient.invalidateQueries({ queryKey: QueryKeys.MEMBERS }),
      ]);

      showNotification(HebrewTexts.users.roleChanged);

      onClose();
    },
    onError: (error) => {
      setIsAdminHandoverWarningOpen(false);
      setErrorMessage(getUserActionErrorMessage(error));
    },
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
    saveRole: () =>
      isAdminHandover ? setIsAdminHandoverWarningOpen(true) : changeRoleMutation.mutate(),
    isSaving: changeRoleMutation.isPending,
    isAdminHandoverWarningOpen,
    newAdminName: `${user.firstName} ${user.lastName}`,
    confirmAdminHandover: () => changeRoleMutation.mutate(),
    cancelAdminHandover: () => setIsAdminHandoverWarningOpen(false),
  };
};
