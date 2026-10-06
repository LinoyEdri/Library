import { ActionType, CopyStatus, EntityType } from '@prisma/client';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { bookCopyRepository } from '../repositories/book-copy.repository.ts';
import { bookRepository } from '../repositories/book.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type {
  AddBookCopyInput,
  ChangeBookCopyStatusInput,
} from '../types/requests/book.requests.types.ts';
import type { BookCopyRecordResponse } from '../types/responses/book.response.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { buildCopyStatusChange } from '../utils/books/build-copy-status-change.ts';
import { toBookCopyResponse } from '../utils/mappers/to-book-response.ts';

// Physical copies of a book (staff only)
export const bookCopyService = {
  async addCopy(
    actingUser: AuthenticatedUser,
    bookId: string,
    copy: AddBookCopyInput,
  ): Promise<BookCopyRecordResponse> {
    const book = await bookRepository.findById(bookId);

    if (!book) {
      throw new NotFoundError('Book not found');
    }

    const createdCopy = await runInDatabaseTransaction(async (transactionClient) => {
      const newCopy = await bookCopyRepository.create(
        bookId,
        copy.barcode,
        actingUser.id,
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.BOOK_COPY_CREATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.BOOK_COPY,
          affectedRecordId: newCopy.id,
          newValue: toBookCopyResponse(newCopy),
          additionalContext: { bookId },
        },
        transactionClient,
      );

      return newCopy;
    });

    return toBookCopyResponse(createdCopy);
  },

  // Mark lost / damaged / disabled, or back to available. Copies on loan cannot be changed here.
  async changeCopyStatus(
    actingUser: AuthenticatedUser,
    copyId: string,
    { status: targetStatus }: ChangeBookCopyStatusInput,
  ): Promise<BookCopyRecordResponse> {
    const copy = await bookCopyRepository.findById(copyId);

    if (!copy) {
      throw new NotFoundError('Book copy not found');
    }

    if (copy.status === CopyStatus.ON_LOAN) {
      throw new ConflictError('The copy is on loan; process the return first');
    }

    if (copy.status === targetStatus) {
      throw new ConflictError('The copy already has this status');
    }

    const statusChange = buildCopyStatusChange(targetStatus, actingUser.id);

    const updatedCopy = await runInDatabaseTransaction(async (transactionClient) => {
      const changedCopy = await bookCopyRepository.updateStatus(
        copyId,
        statusChange.data,
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: statusChange.auditActionType,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.BOOK_COPY,
          affectedRecordId: copyId,
          previousValue: { status: copy.status },
          newValue: { status: changedCopy.status },
          additionalContext: { bookId: copy.bookId },
        },
        transactionClient,
      );

      return changedCopy;
    });

    return toBookCopyResponse(updatedCopy);
  },
};
