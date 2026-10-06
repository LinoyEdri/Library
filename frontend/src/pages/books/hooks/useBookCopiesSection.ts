import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import type { CopyStatus } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useNotification } from '../../../hooks/useNotification';
import { ApiRequestError } from '../../../services/api-request-error';
import { booksApi } from '../../../services/books.api';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';

// Adding copies by barcode and changing a copy's status
export const useBookCopiesSection = (bookId: string) => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const [newCopyBarcode, setNewCopyBarcode] = useState('');

  const [barcodeErrorMessage, setBarcodeErrorMessage] = useState<string | null>(null);

  const refreshBooks = () => queryClient.invalidateQueries({ queryKey: QueryKeys.BOOKS });

  const addCopyMutation = useMutation({
    mutationFn: (barcode: string) => booksApi.addCopy(bookId, barcode),
    onSuccess: () => {
      setNewCopyBarcode('');
      showNotification(HebrewTexts.books.copyAdded);
      return refreshBooks();
    },
    onError: (error) => {
      const isDuplicateBarcode =
        error instanceof ApiRequestError && error.statusCode === StatusCodes.CONFLICT;

      setBarcodeErrorMessage(
        isDuplicateBarcode ? HebrewTexts.books.duplicateBarcode : getHebrewErrorMessage(error),
      );
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ copyId, status }: { copyId: string; status: CopyStatus }) =>
      booksApi.changeCopyStatus(copyId, status),
    onSuccess: () => {
      showNotification(HebrewTexts.books.copyStatusChanged);
      return refreshBooks();
    },
    onError: (error) => showNotification(getHebrewErrorMessage(error), 'error'),
  });

  const changeNewCopyBarcode = (barcode: string) => {
    setNewCopyBarcode(barcode);
    setBarcodeErrorMessage(null);
  };

  const submitNewCopy = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedBarcode = newCopyBarcode.trim();

    if (trimmedBarcode) {
      addCopyMutation.mutate(trimmedBarcode);
    }
  };

  return {
    newCopyBarcode,
    changeNewCopyBarcode,
    barcodeErrorMessage,
    submitNewCopy,
    isAddingCopy: addCopyMutation.isPending,
    changeCopyStatus: (copyId: string, status: CopyStatus) =>
      changeStatusMutation.mutate({ copyId, status }),
    isChangingStatus: changeStatusMutation.isPending,
  };
};
