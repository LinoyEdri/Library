import type { BookCopy } from '@prisma/client';
import type { BookWithRelations } from '../../types/database/book-with-relations.types.ts';
import type { CopyCounts } from '../../types/database/copy-counts.types.ts';
import type {
  BookCopyRecordResponse,
  BookDetailsRecordResponse,
  BookSummaryRecordResponse,
} from '../../types/responses/book.response.types.ts';

// Explicit mappings: internal columns (created/disabled by user ids) are not sent to clients

export const toBookCopyResponse = (copy: BookCopy): BookCopyRecordResponse => ({
  id: copy.id,
  barcode: copy.barcode,
  status: copy.status,
  acquisitionDate: copy.acquisitionDate,
  updatedDate: copy.updatedDate,
  disabledDate: copy.disabledDate,
});

export const toBookSummaryResponse = (
  book: BookWithRelations,
  copyCounts: CopyCounts,
): BookSummaryRecordResponse => ({
  id: book.id,
  title: book.title,
  isbn: book.isbn,
  language: book.language,
  publicationYear: book.publicationYear,
  imageUrl: book.imageUrl,
  status: book.status,
  publisher: book.publisher,
  authors: book.authors.map((bookAuthor) => ({
    ...bookAuthor.author,
    isPrimaryAuthor: bookAuthor.isPrimaryAuthor,
  })),
  categories: book.categories.map((bookCategory) => bookCategory.category),
  availableCopies: copyCounts.availableCopies,
  totalCopies: copyCounts.totalCopies,
});

// `copies` is left out entirely when the caller may not see them
export const toBookDetailsResponse = (
  book: BookWithRelations,
  copyCounts: CopyCounts,
  copies?: BookCopy[],
): BookDetailsRecordResponse => ({
  ...toBookSummaryResponse(book, copyCounts),
  description: book.description,
  createdDate: book.createdDate,
  updatedDate: book.updatedDate,
  disabledDate: book.disabledDate,
  ...(copies && { copies: copies.map(toBookCopyResponse) }),
});
