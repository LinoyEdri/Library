import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '../../../services/books.api';
import { buildBookDetailsQueryKey } from './useBookDetailsPage';

// "/books/new" creates a book; "/books/:bookId/edit" loads the book to edit first
export const useBookFormPage = () => {
  const { bookId } = useParams();

  const isEditMode = Boolean(bookId);

  const bookQuery = useQuery({
    queryKey: buildBookDetailsQueryKey(bookId ?? ''),
    queryFn: () => booksApi.getBook(bookId ?? ''),
    enabled: isEditMode,
    retry: false,
  });

  return {
    isEditMode,
    editedBook: bookQuery.data,
    isLoadingBook: isEditMode && bookQuery.isPending,
    loadError: isEditMode ? bookQuery.error : null,
    retryLoad: () => bookQuery.refetch(),
  };
};
