import { useNavigate } from 'react-router';
import { buildLoanDetailsPath } from '../../../utils/build-loan-paths';

// A click on a dashboard loan row opens the loan
export const useDashboardLoansCard = () => {
  const navigate = useNavigate();

  return {
    openLoan: (loanId: string) => navigate(buildLoanDetailsPath(loanId)),
  };
};
