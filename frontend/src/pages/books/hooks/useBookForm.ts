import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import type { BookDetailsInput, BookDetailsResponse } from '@library/shared';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { QueryKeys } from '../../../constants/query-keys';
import { useNotification } from '../../../hooks/useNotification';
import { ApiRequestError } from '../../../services/api-request-error';
import { booksApi } from '../../../services/books.api';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { buildBookDetailsPath } from '../../../utils/build-book-paths';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';
import { bookFormSchema, type BookFormInput, type BookFormOutput } from '../book-form.schema';

const DEFAULT_LANGUAGE = 'עברית';

// Book from the API -> form values (empty form when creating)
const toFormValues = (book?: BookDetailsResponse): BookFormInput => ({
  title: book?.title ?? '',
  isbn: book?.isbn ?? '',
  publicationYear: book?.publicationYear?.toString() ?? '',
  language: book?.language ?? DEFAULT_LANGUAGE,
  imageUrl: book?.imageUrl ?? '',
  description: book?.description ?? '',
  publisher: book ? { id: book.publisher.id, label: book.publisher.name } : null,
  authors:
    book?.authors.map((author) => ({
      id: author.id,
      label: `${author.firstName} ${author.lastName}`,
    })) ?? [],
  categories: book?.categories.map((category) => ({ id: category.id, label: category.name })) ?? [],
});

// Form values -> API body (pickers become ids; the first author is the primary one)
const toBookDetails = (formValues: BookFormOutput): BookDetailsInput => ({
  title: formValues.title,
  isbn: formValues.isbn,
  publicationYear: formValues.publicationYear,
  language: formValues.language,
  imageUrl: formValues.imageUrl,
  description: formValues.description,
  publisherId: formValues.publisher?.id ?? '',
  authorIds: formValues.authors.map((author) => author.id),
  categoryIds: formValues.categories.map((category) => category.id),
});

// Create or edit a book, then open its details page
export const useBookForm = (editedBook?: BookDetailsResponse) => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const { control, handleSubmit, setError } = useForm<BookFormInput, unknown, BookFormOutput>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: toFormValues(editedBook),
  });

  const saveMutation = useMutation({
    mutationFn: (details: BookDetailsInput) =>
      editedBook ? booksApi.update(editedBook.id, details) : booksApi.create(details),
  });

  const submitBook = handleSubmit(async (formValues) => {
    try {
      const savedBook = await saveMutation.mutateAsync(toBookDetails(formValues));

      await queryClient.invalidateQueries({ queryKey: QueryKeys.BOOKS });

      showNotification(editedBook ? HebrewTexts.books.bookUpdated : HebrewTexts.books.bookCreated);

      navigate(buildBookDetailsPath(savedBook.id));
    } catch (error) {
      if (error instanceof ApiRequestError && error.statusCode === StatusCodes.CONFLICT) {
        setError('isbn', { message: HebrewTexts.books.duplicateIsbn });
        return;
      }

      if (applyServerFieldErrors(error, setError)) {
        return;
      }

      // A 400 without field details means a picked author/category/publisher is no longer active
      const isInvalidReference =
        error instanceof ApiRequestError && error.statusCode === StatusCodes.BAD_REQUEST;

      showNotification(
        isInvalidReference ? HebrewTexts.books.invalidReferences : getHebrewErrorMessage(error),
        'error',
      );
    }
  });

  return {
    control,
    submitBook,
    isSaving: saveMutation.isPending,
    pageTitle: editedBook ? HebrewTexts.books.editBookTitle : HebrewTexts.books.newBookTitle,
    cancelPath: editedBook ? buildBookDetailsPath(editedBook.id) : '..',
  };
};
