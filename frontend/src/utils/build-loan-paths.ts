import { RoutePaths } from '../constants/route-paths';

// "/loans/:loanId" -> "/loans/0198..." for links to a specific loan
export const buildLoanDetailsPath = (loanId: string): string =>
  RoutePaths.LOAN_DETAILS.replace(':loanId', loanId);
