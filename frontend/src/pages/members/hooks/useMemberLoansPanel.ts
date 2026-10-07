import { useNavigate } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLoanActions } from '../../../components/loans/hooks/useLoanActions';
import { QueryKeys } from '../../../constants/query-keys';
import { useTablePaging } from '../../../hooks/useTablePaging';
import { loansApi, type LoanListParams } from '../../../services/loans.api';
import { buildLoanDetailsPath } from '../../../utils/build-loan-paths';

const MEMBER_LOANS_PAGE_SIZE = 10;

// The member's loan history (newest first) with the staff loan actions
export const useMemberLoansPanel = (memberId: string) => {
  const navigate = useNavigate();

  const loanActions = useLoanActions();

  const paging = useTablePaging(MEMBER_LOANS_PAGE_SIZE);

  const listParams: LoanListParams = {
    page: paging.pageIndex + 1,
    pageSize: paging.pageSize,
    memberId,
  };

  const loansQuery = useQuery({
    queryKey: [...QueryKeys.LOANS, listParams],
    queryFn: () => loansApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  return {
    loanActions,
    paging,
    loans: loansQuery.data?.items ?? [],
    totalItems: loansQuery.data?.meta.totalItems ?? 0,
    isLoading: loansQuery.isFetching,
    openLoan: (loanId: string) => navigate(buildLoanDetailsPath(loanId)),
  };
};
