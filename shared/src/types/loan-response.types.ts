import type { CopyStatus } from '../enums/copy-status.enum.js';
import type { LoanStatus } from '../enums/loan-status.enum.js';

// Someone who acted on a loan (created it or processed the return)
export interface LoanActorSummary {
  id: string;
  firstName: string;
  lastName: string;
}

// A loan with what the screens need about the member, the book and the copy. Dates are ISO strings.
export interface LoanResponse {
  id: string;
  status: LoanStatus;
  createdDate: string;
  dueDate: string;
  returnRequestedDate: string | null;
  returnRequestCancelledDate: string | null;
  returnDate: string | null;
  returnProcessedDate: string | null;
  updatedDate: string;
  // True for open loans whose due date has passed (even before the hourly overdue job runs)
  isPastDue: boolean;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  book: {
    id: string;
    title: string;
    imageUrl: string;
  };
  copy: {
    id: string;
    barcode: string;
    status: CopyStatus;
  };
  createdBy: LoanActorSummary;
  returnProcessedBy: LoanActorSummary | null;
}
