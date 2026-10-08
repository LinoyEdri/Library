import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Permission } from '@library/shared';
import { useLoanActions } from '../../../components/loans/hooks/useLoanActions';
import { QueryKeys } from '../../../constants/query-keys';
import { useCan } from '../../../hooks/useCan';
import { loansApi } from '../../../services/loans.api';
import { buildLoanTimelineEvents } from '../../../utils/build-loan-timeline-events';

// Loads the loan from the URL, builds its timeline and offers the user's actions
export const useLoanDetailsPage = () => {
  const { loanId = '' } = useParams();

  const canOpenMember = useCan(Permission.MEMBERS_VIEW);

  const loanActions = useLoanActions();

  // Inside the loans key, so every loan action refreshes it too
  const loanQuery = useQuery({
    queryKey: [...QueryKeys.LOANS, 'details', loanId],
    queryFn: () => loansApi.getLoan(loanId),
    retry: false,
  });

  return {
    loan: loanQuery.data,
    timelineEvents: loanQuery.data ? buildLoanTimelineEvents(loanQuery.data) : [],
    isLoading: loanQuery.isPending,
    loadError: loanQuery.error,
    retryLoad: () => loanQuery.refetch(),
    canOpenMember,
    loanActions,
  };
};
