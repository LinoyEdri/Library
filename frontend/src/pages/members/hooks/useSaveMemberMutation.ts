import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MemberResponse } from '@library/shared';
import { QueryKeys } from '../../../constants/query-keys';
import { useNotification } from '../../../hooks/useNotification';
import { buildMemberDetailsPath } from '../../../utils/build-member-paths';

// Shared by the member forms: save, refresh the lists, notify and open the member
export const useSaveMemberMutation = <Input>(
  saveMember: (input: Input) => Promise<MemberResponse>,
  successMessage: string,
) => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: saveMember,
    onSuccess: async (savedMember) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QueryKeys.MEMBERS }),
        queryClient.invalidateQueries({ queryKey: QueryKeys.MEMBER_CANDIDATES }),
      ]);

      showNotification(successMessage);

      navigate(buildMemberDetailsPath(savedMember.id));
    },
  });
};
