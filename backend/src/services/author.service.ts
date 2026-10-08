import { ActionType, EntityType, RecordStatus, type Author } from '@prisma/client';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { authorRepository } from '../repositories/author.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type {
  AuthorDetailsInput,
  AuthorListQueryInput,
} from '../types/requests/catalog-reference.requests.types.ts';
import type { AuthorRecordResponse } from '../types/responses/catalog-reference.response.types.ts';
import type { PaginatedResult } from '../types/responses/paginated-result.response.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { resolveVisibleRecordStatus } from '../utils/authorization/resolve-visible-record-status.ts';
import { toAuthorResponse } from '../utils/mappers/to-catalog-reference-response.ts';
import { buildPaginationMeta } from '../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../utils/pagination/to-page-request.ts';
import {
  buildDisableStatusChange,
  buildReactivateStatusChange,
} from '../utils/records/build-record-status-change.ts';

// Loads the author or fails with 404. Disabled authors are hidden from non-managers.
const findVisibleAuthorOrThrow = async (
  authorId: string,
  canSeeDisabledRecords = true,
): Promise<Author> => {
  const author = await authorRepository.findById(authorId);

  if (!author || (!canSeeDisabledRecords && author.status === RecordStatus.DISABLED)) {
    throw new NotFoundError('Author not found');
  }

  return author;
};

export const authorService = {
  async listAuthors(
    query: AuthorListQueryInput,
    canSeeDisabledRecords: boolean,
  ): Promise<PaginatedResult<AuthorRecordResponse>> {
    const { authors, totalItems } = await authorRepository.findPage({
      ...toPageRequest(query.page, query.pageSize),
      search: query.search,
      status: resolveVisibleRecordStatus(query.status, canSeeDisabledRecords),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: authors.map(toAuthorResponse),
      meta: buildPaginationMeta(query.page, query.pageSize, totalItems),
    };
  },

  async getAuthor(authorId: string, canSeeDisabledRecords: boolean): Promise<AuthorRecordResponse> {
    return toAuthorResponse(await findVisibleAuthorOrThrow(authorId, canSeeDisabledRecords));
  },

  async createAuthor(
    actingUser: AuthenticatedUser,
    details: AuthorDetailsInput,
  ): Promise<AuthorRecordResponse> {
    const createdAuthor = await runInDatabaseTransaction(async (transactionClient) => {
      const author = await authorRepository.create(details, actingUser.id, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.AUTHOR_CREATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.AUTHOR,
          affectedRecordId: author.id,
          newValue: toAuthorResponse(author),
        },
        transactionClient,
      );

      return author;
    });

    return toAuthorResponse(createdAuthor);
  },

  async updateAuthor(
    actingUser: AuthenticatedUser,
    authorId: string,
    details: AuthorDetailsInput,
  ): Promise<AuthorRecordResponse> {
    const authorBeforeUpdate = await findVisibleAuthorOrThrow(authorId);

    const updatedAuthor = await runInDatabaseTransaction(async (transactionClient) => {
      const author = await authorRepository.update(authorId, details, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.AUTHOR_UPDATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.AUTHOR,
          affectedRecordId: authorId,
          previousValue: toAuthorResponse(authorBeforeUpdate),
          newValue: toAuthorResponse(author),
        },
        transactionClient,
      );

      return author;
    });

    return toAuthorResponse(updatedAuthor);
  },

  async disableAuthor(
    actingUser: AuthenticatedUser,
    authorId: string,
  ): Promise<AuthorRecordResponse> {
    const author = await findVisibleAuthorOrThrow(authorId);

    if (author.status === RecordStatus.DISABLED) {
      throw new ConflictError('Author is already disabled');
    }

    const disabledAuthor = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedAuthor = await authorRepository.updateStatus(
        authorId,
        buildDisableStatusChange(actingUser.id),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.AUTHOR_DISABLED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.AUTHOR,
          affectedRecordId: authorId,
          previousValue: { status: author.status },
          newValue: { status: updatedAuthor.status },
        },
        transactionClient,
      );

      return updatedAuthor;
    });

    return toAuthorResponse(disabledAuthor);
  },

  async reactivateAuthor(
    actingUser: AuthenticatedUser,
    authorId: string,
  ): Promise<AuthorRecordResponse> {
    const author = await findVisibleAuthorOrThrow(authorId);

    if (author.status === RecordStatus.ACTIVE) {
      throw new ConflictError('Author is already active');
    }

    const reactivatedAuthor = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedAuthor = await authorRepository.updateStatus(
        authorId,
        buildReactivateStatusChange(),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.AUTHOR_REACTIVATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.AUTHOR,
          affectedRecordId: authorId,
          previousValue: { status: author.status },
          newValue: { status: updatedAuthor.status },
        },
        transactionClient,
      );

      return updatedAuthor;
    });

    return toAuthorResponse(reactivatedAuthor);
  },
};
