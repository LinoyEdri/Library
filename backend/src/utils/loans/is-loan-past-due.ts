import type { LoanStatus } from '@prisma/client';
import { OPEN_LOAN_STATUSES } from '../../constants/loan-statuses.ts';

// An open loan whose due date has passed
export const isLoanPastDue = (
  loan: { status: LoanStatus; dueDate: Date },
  now: Date = new Date(),
): boolean => OPEN_LOAN_STATUSES.includes(loan.status) && loan.dueDate < now;
