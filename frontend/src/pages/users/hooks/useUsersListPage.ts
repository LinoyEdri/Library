import { useState } from 'react';
import { useNavigate } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RecordStatus, Role } from '@library/shared';
import { QueryKeys } from '../../../constants/query-keys';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { usersApi, type UserListParams } from '../../../services/users.api';
import { buildUserDetailsPath } from '../../../utils/build-user-paths';

const DEFAULT_PAGE_SIZE = 20;

// Users table state: search, role and status filters, paging, and opening a user
export const useUsersListPage = () => {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<RecordStatus | ''>('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedSearchText = useDebouncedValue(searchText.trim());

  const listParams: UserListParams = {
    page: pageIndex + 1,
    pageSize,
    search: debouncedSearchText || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  };

  const usersQuery = useQuery({
    queryKey: [...QueryKeys.USERS, listParams],
    queryFn: () => usersApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  // Every filter change starts again from the first page
  const withFirstPage =
    <Value>(setFilter: (value: Value) => void) =>
    (value: Value) => {
      setFilter(value);
      setPageIndex(0);
    };

  return {
    users: usersQuery.data?.items ?? [],
    totalItems: usersQuery.data?.meta.totalItems ?? 0,
    isLoading: usersQuery.isFetching,
    searchText,
    changeSearchText: withFirstPage(setSearchText),
    roleFilter,
    changeRoleFilter: withFirstPage(setRoleFilter),
    statusFilter,
    changeStatusFilter: withFirstPage(setStatusFilter),
    pageIndex,
    setPageIndex,
    pageSize,
    changePageSize: withFirstPage(setPageSize),
    openUser: (userId: string) => navigate(buildUserDetailsPath(userId)),
  };
};
