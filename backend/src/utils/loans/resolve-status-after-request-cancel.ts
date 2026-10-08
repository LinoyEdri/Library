import { LoanStatus } from '@prisma/client';

// When a member cancels a return request the loan goes back to ACTIVE, or OVERDUE if it is already late
export const resolveStatusAfterRequestCancel = (
  dueDate: Date,
  now: Date = new Date(),
): LoanStatus => (dueDate < now ? LoanStatus.OVERDUE : LoanStatus.ACTIVE);
