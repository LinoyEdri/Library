import type { CopyStatus, RecordStatus } from '@prisma/client';

export interface BookAuthorSummary {
  id: string;
  firstName: string;
  lastName: string;
  isPrimaryAuthor: boolean;
}

export interface NamedRecordSummary {
  id: string;
  name: string;
}

// One physical copy (sent to staff only)
export interface BookCopyRecordResponse {
  id: string;
  barcode: string;
  status: CopyStatus;
  acquisitionDate: Date;
  updatedDate: Date;
  disabledDate: Date | null;
}

// A book in the catalog list
export interface BookSummaryRecordResponse {
  id: string;
  title: string;
  isbn: string | null;
  language: string;
  publicationYear: number | null;
  imageUrl: string;
  status: RecordStatus;
  publisher: NamedRecordSummary;
  authors: BookAuthorSummary[];
  categories: NamedRecordSummary[];
  availableCopies: number;
  totalCopies: number;
}

// A single book with all details; `copies` only for staff
export interface BookDetailsRecordResponse extends BookSummaryRecordResponse {
  description: string | null;
  createdDate: Date;
  updatedDate: Date;
  disabledDate: Date | null;
  copies?: BookCopyRecordResponse[];
}
