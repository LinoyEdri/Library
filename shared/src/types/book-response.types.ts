import type { CopyStatus } from '../enums/copy-status.enum.js';
import type { RecordStatus } from '../enums/record-status.enum.js';

// Short author/category/publisher info shown inside a book. Dates are ISO strings.
export interface BookAuthorSummary {
  id: string;
  firstName: string;
  lastName: string;
  isPrimaryAuthor: boolean;
}

export interface BookCategorySummary {
  id: string;
  name: string;
}

export interface BookPublisherSummary {
  id: string;
  name: string;
}

// One physical copy (staff only)
export interface BookCopyResponse {
  id: string;
  barcode: string;
  status: CopyStatus;
  acquisitionDate: string;
  updatedDate: string;
  disabledDate: string | null;
}

// A book in the catalog list
export interface BookSummaryResponse {
  id: string;
  title: string;
  isbn: string | null;
  language: string;
  publicationYear: number | null;
  imageUrl: string;
  status: RecordStatus;
  publisher: BookPublisherSummary;
  authors: BookAuthorSummary[];
  categories: BookCategorySummary[];
  // Copies on the shelf right now / copies in circulation (available + on loan)
  availableCopies: number;
  totalCopies: number;
}

// A single book with all details. `copies` is only sent to staff.
export interface BookDetailsResponse extends BookSummaryResponse {
  description: string | null;
  createdDate: string;
  updatedDate: string;
  disabledDate: string | null;
  copies?: BookCopyResponse[];
}
