// Lifecycle of a loan - must match Prisma `LoanStatus`
export const LoanStatus = {
  ACTIVE: 'ACTIVE',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  RETURNED: 'RETURNED',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;

export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];
