import { LoanStatus } from '@prisma/client';

// Loans that still hold a copy: they count toward the member's limit and can be returned or cancelled
export const OPEN_LOAN_STATUSES: LoanStatus[] = [
  LoanStatus.ACTIVE,
  LoanStatus.OVERDUE,
  LoanStatus.RETURN_REQUESTED,
];

// Loans a member may ask to return
export const RETURN_REQUESTABLE_LOAN_STATUSES: LoanStatus[] = [
  LoanStatus.ACTIVE,
  LoanStatus.OVERDUE,
];
