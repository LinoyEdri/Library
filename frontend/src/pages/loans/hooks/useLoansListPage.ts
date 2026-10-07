import { useState } from 'react';
import { useNavigate } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LoanStatus, Permission } from '@library/shared';
import type { ReferenceOption } from '../../../components/catalog-reference/reference-option.types';
import { useLoanActions } from '../../../components/loans/hooks/useLoanActions';
import { QueryKeys } from '../../../constants/query-keys';
import { useCan } from '../../../hooks/useCan';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useTablePaging } from '../../../hooks/useTablePaging';
import { loansApi, type LoanListParams } from '../../../services/loans.api';
import { buildLoanDetailsPath } from '../../../utils/build-loan-paths';

// Staff tabs: every loan, return requests waiting for the desk, and late loans
export type LoansListTab = 'all' | 'pendingReturns' | 'overdue';

// Loans list: staff get tabs, member/book filters and "new loan"; members see their own loans
export const useLoansListPage = () => {
  const navigate = useNavigate();

  const canViewAllLoans = useCan(Permission.LOANS_VIEW_ALL);
  const canCreateLoans = useCan(Permission.LOANS_CREATE);

  const loanActions = useLoanActions();

  const paging = useTablePaging();

  const [selectedTab, setSelectedTab] = useState<LoansListTab>('all');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | ''>('');
  const [memberFilter, setMemberFilter] = useState<ReferenceOption | null>(null);
  const [bookFilter, setBookFilter] = useState<ReferenceOption | null>(null);
  const [isNewLoanDialogOpen, setIsNewLoanDialogOpen] = useState(false);

  const debouncedSearchText = useDebouncedValue(searchText.trim());

  // The tab decides the status and the order: open work is sorted by the nearest due date
  const tabStatus = selectedTab === 'pendingReturns' ? LoanStatus.RETURN_REQUESTED : undefined;
  const isAllTab = selectedTab === 'all';

  const listParams: LoanListParams = {
    page: paging.pageIndex + 1,
    pageSize: paging.pageSize,
    search: debouncedSearchText || undefined,
    status: tabStatus ?? (statusFilter || undefined),
    onlyOverdue: selectedTab === 'overdue' || undefined,
    memberId: memberFilter?.id,
    bookId: bookFilter?.id,
    sortBy: isAllTab ? 'createdDate' : 'dueDate',
    sortOrder: isAllTab ? 'desc' : 'asc',
  };

  const loansQuery = useQuery({
    queryKey: [...QueryKeys.LOANS, listParams],
    queryFn: () => loansApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  // Every filter change starts again from the first page
  const withFirstPage =
    <Value>(setValue: (value: Value) => void) =>
    (value: Value) => {
      setValue(value);
      paging.resetToFirstPage();
    };

  return {
    canViewAllLoans,
    canCreateLoans,
    loanActions,
    paging,
    loans: loansQuery.data?.items ?? [],
    totalItems: loansQuery.data?.meta.totalItems ?? 0,
    isLoading: loansQuery.isFetching,
    selectedTab,
    selectTab: withFirstPage(setSelectedTab),
    showStatusFilter: isAllTab,
    searchText,
    changeSearchText: withFirstPage(setSearchText),
    statusFilter,
    changeStatusFilter: withFirstPage(setStatusFilter),
    memberFilter,
    changeMemberFilter: withFirstPage(setMemberFilter),
    bookFilter,
    changeBookFilter: withFirstPage(setBookFilter),
    isNewLoanDialogOpen,
    openNewLoanDialog: () => setIsNewLoanDialogOpen(true),
    closeNewLoanDialog: () => setIsNewLoanDialogOpen(false),
    openLoan: (loanId: string) => navigate(buildLoanDetailsPath(loanId)),
  };
};
