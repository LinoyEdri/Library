import type { LoanWithDetails } from '../../types/database/loan-with-details.types.ts';
import type { LoanRecordResponse } from '../../types/responses/loan.response.types.ts';
import { isLoanPastDue } from '../loans/is-loan-past-due.ts';

// Flattens a loan with its member, copy and book into the API shape
export const toLoanResponse = (loan: LoanWithDetails): LoanRecordResponse => ({
  id: loan.id,
  status: loan.status,
  createdDate: loan.createdDate,
  dueDate: loan.dueDate,
  returnRequestedDate: loan.returnRequestedDate,
  returnRequestCancelledDate: loan.returnRequestCancelledDate,
  returnDate: loan.returnDate,
  returnProcessedDate: loan.returnProcessedDate,
  updatedDate: loan.updatedDate,
  isPastDue: isLoanPastDue(loan),
  member: {
    id: loan.member.id,
    firstName: loan.member.user.firstName,
    lastName: loan.member.user.lastName,
    email: loan.member.user.email,
  },
  book: loan.bookCopy.book,
  copy: {
    id: loan.bookCopy.id,
    barcode: loan.bookCopy.barcode,
    status: loan.bookCopy.status,
  },
  createdBy: loan.createdBy,
  returnProcessedBy: loan.returnProcessedBy,
});
