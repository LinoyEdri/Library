import type {
  BookCopyResponse,
  BookDetailsInput,
  BookDetailsResponse,
  BookSummaryResponse,
  CopyStatus,
  RecordStatus,
} from '@library/shared';
import { sendApiRequest, sendPaginatedApiRequest } from './api-client';

// Query string of GET /books
export interface BookListParams {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  language?: string;
  availability?: 'available' | 'unavailable';
  status?: RecordStatus;
  sortBy?: 'title' | 'publicationYear' | 'createdDate';
  sortOrder?: 'asc' | 'desc';
}

// Calls to /books and /book-copies
export const booksApi = {
  list: (params: BookListParams) =>
    sendPaginatedApiRequest<BookSummaryResponse>({ method: 'GET', url: '/books', params }),

  listLanguages: () => sendApiRequest<string[]>({ method: 'GET', url: '/books/languages' }),

  getBook: (bookId: string) =>
    sendApiRequest<BookDetailsResponse>({ method: 'GET', url: `/books/${bookId}` }),

  create: (details: BookDetailsInput) =>
    sendApiRequest<BookDetailsResponse>({ method: 'POST', url: '/books', data: details }),

  update: (bookId: string, details: BookDetailsInput) =>
    sendApiRequest<BookDetailsResponse>({
      method: 'PATCH',
      url: `/books/${bookId}`,
      data: details,
    }),

  disable: (bookId: string) =>
    sendApiRequest<BookDetailsResponse>({ method: 'POST', url: `/books/${bookId}/disable` }),

  reactivate: (bookId: string) =>
    sendApiRequest<BookDetailsResponse>({ method: 'POST', url: `/books/${bookId}/reactivate` }),

  addCopy: (bookId: string, barcode: string) =>
    sendApiRequest<BookCopyResponse>({
      method: 'POST',
      url: `/books/${bookId}/copies`,
      data: { barcode },
    }),

  changeCopyStatus: (copyId: string, status: CopyStatus) =>
    sendApiRequest<BookCopyResponse>({
      method: 'PATCH',
      url: `/book-copies/${copyId}/status`,
      data: { status },
    }),
};
