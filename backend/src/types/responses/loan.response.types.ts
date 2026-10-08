import type { CopyStatus, LoanStatus } from '@prisma/client';

export interface LoanActorSummary {
  id: string;
  firstName: string;
  lastName: string;
}

// A loan with member, book and copy details
export interface LoanRecordResponse {
  id: string;
  status: LoanStatus;
  createdDate: Date;
  dueDate: Date;
  returnRequestedDate: Date | null;
  returnRequestCancelledDate: Date | null;
  returnDate: Date | null;
  returnProcessedDate: Date | null;
  updatedDate: Date;
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
