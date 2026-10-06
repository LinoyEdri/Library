import { useState } from 'react';
import { useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Permission } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useCan } from '../../../hooks/useCan';
import { useNotification } from '../../../hooks/useNotification';
import { booksApi } from '../../../services/books.api';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';

// Cache key of one book's details (inside the books key, so list refreshes also refresh it)
export const buildBookDetailsQueryKey = (bookId: string) => [...QueryKeys.BOOKS, 'details', bookId];

// Loads the book from the URL and handles disable/reactivate
export const useBookDetailsPage = () => {
  const { bookId = '' } = useParams();

  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const canEditBook = useCan(Permission.BOOKS_UPDATE);

  const canDisableBook = useCan(Permission.BOOKS_DISABLE);

  const canManageCopies = useCan(Permission.BOOK_COPIES_MANAGE);

  const [isDisableConfirmationOpen, setIsDisableConfirmationOpen] = useState(false);

  const bookQuery = useQuery({
    queryKey: buildBookDetailsQueryKey(bookId),
    queryFn: () => booksApi.getBook(bookId),
    retry: false,
  });

  const refreshBooks = () => queryClient.invalidateQueries({ queryKey: QueryKeys.BOOKS });

  const disableMutation = useMutation({
    mutationFn: () => booksApi.disable(bookId),
    onSuccess: () => {
      setIsDisableConfirmationOpen(false);
      showNotification(HebrewTexts.books.bookDisabled);
      return refreshBooks();
    },
    onError: (error) => showNotification(getHebrewErrorMessage(error), 'error'),
  });

  const reactivateMutation = useMutation({
    mutationFn: () => booksApi.reactivate(bookId),
    onSuccess: () => {
      showNotification(HebrewTexts.books.bookReactivated);
      return refreshBooks();
    },
    onError: (error) => showNotification(getHebrewErrorMessage(error), 'error'),
  });

  return {
    bookId,
    book: bookQuery.data,
    isLoading: bookQuery.isPending,
    loadError: bookQuery.error,
    retryLoad: () => bookQuery.refetch(),
    canEditBook,
    canDisableBook,
    canManageCopies,
    isDisableConfirmationOpen,
    openDisableConfirmation: () => setIsDisableConfirmationOpen(true),
    closeDisableConfirmation: () => setIsDisableConfirmationOpen(false),
    confirmDisable: () => disableMutation.mutate(),
    isDisabling: disableMutation.isPending,
    reactivateBook: () => reactivateMutation.mutate(),
    isReactivating: reactivateMutation.isPending,
  };
};
