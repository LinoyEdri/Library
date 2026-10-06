import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../../../services/members.api';
import { buildMemberDetailsQueryKey } from './useMemberDetailsPage';

export type MemberCreateMode = 'newPerson' | 'existingUser';

// "/members/new" creates a member (two modes); "/members/:memberId/edit" loads the member first
export const useMemberFormPage = () => {
  const { memberId } = useParams();

  const isEditMode = Boolean(memberId);

  const [createMode, setCreateMode] = useState<MemberCreateMode>('newPerson');

  const memberQuery = useQuery({
    queryKey: buildMemberDetailsQueryKey(memberId ?? ''),
    queryFn: () => membersApi.getMember(memberId ?? ''),
    enabled: isEditMode,
    retry: false,
  });

  return {
    isEditMode,
    editedMember: memberQuery.data,
    isLoadingMember: isEditMode && memberQuery.isPending,
    loadError: isEditMode ? memberQuery.error : null,
    retryLoad: () => memberQuery.refetch(),
    createMode,
    // The toggle reports null when the selected button is clicked again; keep the current mode
    changeCreateMode: (newMode: MemberCreateMode | null) => {
      if (newMode) {
        setCreateMode(newMode);
      }
    },
  };
};
