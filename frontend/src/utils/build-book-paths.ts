import { RoutePaths } from '../constants/route-paths';

// "/books/:bookId" -> "/books/0198..." for links to a specific book
export const buildBookDetailsPath = (bookId: string): string =>
  RoutePaths.BOOK_DETAILS.replace(':bookId', bookId);

export const buildEditBookPath = (bookId: string): string =>
  RoutePaths.EDIT_BOOK.replace(':bookId', bookId);
