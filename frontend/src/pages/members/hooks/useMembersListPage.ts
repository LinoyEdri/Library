import { useState } from 'react';
import { useNavigate } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Permission, type RecordStatus } from '@library/shared';
import { QueryKeys } from '../../../constants/query-keys';
import { useCan } from '../../../hooks/useCan';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { membersApi, type MemberListParams } from '../../../services/members.api';
import { buildMemberDetailsPath } from '../../../utils/build-member-paths';

const DEFAULT_PAGE_SIZE = 20;

// Members table state: search, status filter, paging, and opening a member
export const useMembersListPage = () => {
  const navigate = useNavigate();

  const canManageMembers = useCan(Permission.MEMBERS_MANAGE);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecordStatus | ''>('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedSearchText = useDebouncedValue(searchText.trim());

  const listParams: MemberListParams = {
    page: pageIndex + 1,
    pageSize,
    search: debouncedSearchText || undefined,
    status: statusFilter || undefined,
  };

  const membersQuery = useQuery({
    queryKey: [...QueryKeys.MEMBERS, listParams],
    queryFn: () => membersApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  // Search, filter and page-size changes start again from the first page
  const changeSearchText = (newSearchText: string) => {
    setSearchText(newSearchText);
    setPageIndex(0);
  };

  const changeStatusFilter = (newStatusFilter: RecordStatus | '') => {
    setStatusFilter(newStatusFilter);
    setPageIndex(0);
  };

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  return {
    canManageMembers,
    members: membersQuery.data?.items ?? [],
    totalItems: membersQuery.data?.meta.totalItems ?? 0,
    isLoading: membersQuery.isFetching,
    searchText,
    changeSearchText,
    statusFilter,
    changeStatusFilter,
    pageIndex,
    setPageIndex,
    pageSize,
    changePageSize,
    openMember: (memberId: string) => navigate(buildMemberDetailsPath(memberId)),
  };
};
