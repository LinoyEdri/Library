import { useState } from 'react';
import { useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Permission } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useCan } from '../../../hooks/useCan';
import { useNotification } from '../../../hooks/useNotification';
import { membersApi } from '../../../services/members.api';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';

export type MemberDetailsTab = 'details' | 'loans';

// Cache key of one member (inside the members key, so list refreshes also refresh it)
export const buildMemberDetailsQueryKey = (memberId: string) => [
  ...QueryKeys.MEMBERS,
  'details',
  memberId,
];

// Loads the member from the URL; tabs and disable/reactivate actions
export const useMemberDetailsPage = () => {
  const { memberId = '' } = useParams();

  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const canManageMembers = useCan(Permission.MEMBERS_MANAGE);

  const [selectedTab, setSelectedTab] = useState<MemberDetailsTab>('details');

  const [isDisableConfirmationOpen, setIsDisableConfirmationOpen] = useState(false);

  const memberQuery = useQuery({
    queryKey: buildMemberDetailsQueryKey(memberId),
    queryFn: () => membersApi.getMember(memberId),
    retry: false,
  });

  const refreshMembers = () => queryClient.invalidateQueries({ queryKey: QueryKeys.MEMBERS });

  const showActionError = (error: unknown) =>
    showNotification(getHebrewErrorMessage(error), 'error');

  const disableMutation = useMutation({
    mutationFn: () => membersApi.disable(memberId),
    onSuccess: () => {
      setIsDisableConfirmationOpen(false);
      showNotification(HebrewTexts.members.memberDisabled);
      return refreshMembers();
    },
    onError: showActionError,
  });

  const reactivateMutation = useMutation({
    mutationFn: () => membersApi.reactivate(memberId),
    onSuccess: () => {
      showNotification(HebrewTexts.members.memberReactivated);
      return refreshMembers();
    },
    onError: showActionError,
  });

  return {
    member: memberQuery.data,
    isLoading: memberQuery.isPending,
    loadError: memberQuery.error,
    retryLoad: () => memberQuery.refetch(),
    canManageMembers,
    selectedTab,
    selectTab: setSelectedTab,
    isDisableConfirmationOpen,
    openDisableConfirmation: () => setIsDisableConfirmationOpen(true),
    closeDisableConfirmation: () => setIsDisableConfirmationOpen(false),
    confirmDisable: () => disableMutation.mutate(),
    isDisabling: disableMutation.isPending,
    reactivateMember: () => reactivateMutation.mutate(),
    isReactivating: reactivateMutation.isPending,
  };
};
