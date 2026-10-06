import { ActionType, EntityType, RecordStatus } from '@prisma/client';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { authorRepository } from '../repositories/author.repository.ts';
import { bookCopyRepository } from '../repositories/book-copy.repository.ts';
import { bookRepository } from '../repositories/book.repository.ts';
import { categoryRepository } from '../repositories/category.repository.ts';
import { publisherRepository } from '../repositories/publisher.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type { BookWithRelations } from '../types/database/book-with-relations.types.ts';
import type { CopyCounts } from '../types/database/copy-counts.types.ts';
import type {
  BookDetailsInput,
  BookListQueryInput,
} from '../types/requests/book.requests.types.ts';
import type {
  BookDetailsRecordResponse,
  BookSummaryRecordResponse,
} from '../types/responses/book.response.types.ts';
import type { PaginatedResult } from '../types/responses/paginated-result.response.types.ts';
import { ValidationError } from '../types/errors/BadRequestError.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { resolveVisibleRecordStatus } from '../utils/authorization/resolve-visible-record-status.ts';
import {
  buildCopyCountsByBook,
  EMPTY_COPY_COUNTS,
} from '../utils/books/build-copy-counts-by-book.ts';
import { findUnusableReferenceIds } from '../utils/books/find-unusable-reference-ids.ts';
import { toBookAuditSnapshot } from '../utils/mappers/to-book-audit-snapshot.ts';
import { toBookDetailsResponse, toBookSummaryResponse } from '../utils/mappers/to-book-response.ts';
import { buildPaginationMeta } from '../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../utils/pagination/to-page-request.ts';
import {
  buildDisableStatusChange,
  buildReactivateStatusChange,
} from '../utils/records/build-record-status-change.ts';

// What the caller may see on a book
type BookVisibility = {
  canSeeDisabledBooks: boolean;
  canSeeCopies: boolean;
};

// Loads the book or fails with 404. Disabled books are hidden from users who cannot see them.
const findVisibleBookOrThrow = async (
  bookId: string,
  canSeeDisabledBooks = true,
): Promise<BookWithRelations> => {
  const book = await bookRepository.findById(bookId);

  if (!book || (!canSeeDisabledBooks && book.status === RecordStatus.DISABLED)) {
    throw new NotFoundError('Book not found');
  }

  return book;
};

const loadCopyCountsByBook = async (bookIds: string[]) =>
  buildCopyCountsByBook(await bookCopyRepository.countByBookAndStatus(bookIds));

const loadCopyCounts = async (bookId: string): Promise<CopyCounts> =>
  (await loadCopyCountsByBook([bookId])).get(bookId) ?? EMPTY_COPY_COUNTS;

// Publisher, authors and categories must exist and be active
// (a disabled one may stay only if the book was already linked to it)
const validateBookReferences = async (
  details: BookDetailsInput,
  existingBook?: BookWithRelations,
): Promise<void> => {
  const publisher = await publisherRepository.findById(details.publisherId);

  const publisherIsUsable =
    publisher !== null &&
    (publisher.status === RecordStatus.ACTIVE || existingBook?.publisherId === publisher.id);

  if (!publisherIsUsable) {
    throw new ValidationError('The publisher was not found or is disabled');
  }

  const unusableAuthorIds = findUnusableReferenceIds(
    details.authorIds,
    await authorRepository.findStatusesByIds(details.authorIds),
    new Set(existingBook?.authors.map((bookAuthor) => bookAuthor.authorId)),
  );

  if (unusableAuthorIds.length > 0) {
    throw new ValidationError('One or more authors were not found or are disabled');
  }

  const unusableCategoryIds = findUnusableReferenceIds(
    details.categoryIds,
    await categoryRepository.findStatusesByIds(details.categoryIds),
    new Set(existingBook?.categories.map((bookCategory) => bookCategory.categoryId)),
  );

  if (unusableCategoryIds.length > 0) {
    throw new ValidationError('One or more categories were not found or are disabled');
  }
};

export const bookService = {
  async listBooks(
    query: BookListQueryInput,
    canSeeDisabledBooks: boolean,
  ): Promise<PaginatedResult<BookSummaryRecordResponse>> {
    const { books, totalItems } = await bookRepository.findPage({
      ...toPageRequest(query.page, query.pageSize),
      search: query.search,
      status: resolveVisibleRecordStatus(query.status, canSeeDisabledBooks),
      categoryId: query.categoryId,
      authorId: query.authorId,
      publisherId: query.publisherId,
      language: query.language,
      availability: query.availability,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    const copyCountsByBook = await loadCopyCountsByBook(books.map((book) => book.id));

    return {
      items: books.map((book) =>
        toBookSummaryResponse(book, copyCountsByBook.get(book.id) ?? EMPTY_COPY_COUNTS),
      ),
      meta: buildPaginationMeta(query.page, query.pageSize, totalItems),
    };
  },

  async getBook(bookId: string, visibility: BookVisibility): Promise<BookDetailsRecordResponse> {
    const book = await findVisibleBookOrThrow(bookId, visibility.canSeeDisabledBooks);

    const copies = visibility.canSeeCopies
      ? await bookCopyRepository.findByBookId(bookId)
      : undefined;

    return toBookDetailsResponse(book, await loadCopyCounts(bookId), copies);
  },

  async listLanguages(canSeeDisabledBooks: boolean): Promise<string[]> {
    return bookRepository.findDistinctLanguages(
      resolveVisibleRecordStatus(undefined, canSeeDisabledBooks),
    );
  },

  async createBook(
    actingUser: AuthenticatedUser,
    details: BookDetailsInput,
  ): Promise<BookDetailsRecordResponse> {
    await validateBookReferences(details);

    const createdBook = await runInDatabaseTransaction(async (transactionClient) => {
      const book = await bookRepository.create(details, actingUser.id, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.BOOK_CREATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.BOOK,
          affectedRecordId: book.id,
          newValue: toBookAuditSnapshot(book),
        },
        transactionClient,
      );

      return book;
    });

    return toBookDetailsResponse(createdBook, EMPTY_COPY_COUNTS, []);
  },

  async updateBook(
    actingUser: AuthenticatedUser,
    bookId: string,
    details: BookDetailsInput,
  ): Promise<BookDetailsRecordResponse> {
    const bookBeforeUpdate = await findVisibleBookOrThrow(bookId);

    await validateBookReferences(details, bookBeforeUpdate);

    const updatedBook = await runInDatabaseTransaction(async (transactionClient) => {
      const book = await bookRepository.update(bookId, details, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.BOOK_UPDATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.BOOK,
          affectedRecordId: bookId,
          previousValue: toBookAuditSnapshot(bookBeforeUpdate),
          newValue: toBookAuditSnapshot(book),
        },
        transactionClient,
      );

      return book;
    });

    return toBookDetailsResponse(
      updatedBook,
      await loadCopyCounts(bookId),
      await bookCopyRepository.findByBookId(bookId),
    );
  },

  async disableBook(
    actingUser: AuthenticatedUser,
    bookId: string,
  ): Promise<BookDetailsRecordResponse> {
    const book = await findVisibleBookOrThrow(bookId);

    if (book.status === RecordStatus.DISABLED) {
      throw new ConflictError('Book is already disabled');
    }

    const disabledBook = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedBook = await bookRepository.updateStatus(
        bookId,
        buildDisableStatusChange(actingUser.id),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.BOOK_DISABLED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.BOOK,
          affectedRecordId: bookId,
          previousValue: { status: book.status },
          newValue: { status: updatedBook.status },
        },
        transactionClient,
      );

      return updatedBook;
    });

    return toBookDetailsResponse(
      disabledBook,
      await loadCopyCounts(bookId),
      await bookCopyRepository.findByBookId(bookId),
    );
  },

  async reactivateBook(
    actingUser: AuthenticatedUser,
    bookId: string,
  ): Promise<BookDetailsRecordResponse> {
    const book = await findVisibleBookOrThrow(bookId);

    if (book.status === RecordStatus.ACTIVE) {
      throw new ConflictError('Book is already active');
    }

    const reactivatedBook = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedBook = await bookRepository.updateStatus(
        bookId,
        buildReactivateStatusChange(),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.BOOK_REACTIVATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.BOOK,
          affectedRecordId: bookId,
          previousValue: { status: book.status },
          newValue: { status: updatedBook.status },
        },
        transactionClient,
      );

      return updatedBook;
    });

    return toBookDetailsResponse(
      reactivatedBook,
      await loadCopyCounts(bookId),
      await bookCopyRepository.findByBookId(bookId),
    );
  },
};
