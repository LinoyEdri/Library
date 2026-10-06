import { ActionType, EntityType, RecordStatus, type Publisher } from '@prisma/client';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { publisherRepository } from '../repositories/publisher.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type {
  NamedRecordListQueryInput,
  PublisherDetailsInput,
} from '../types/requests/catalog-reference.requests.types.ts';
import type { PublisherRecordResponse } from '../types/responses/catalog-reference.response.types.ts';
import type { PaginatedResult } from '../types/responses/paginated-result.response.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { resolveVisibleRecordStatus } from '../utils/authorization/resolve-visible-record-status.ts';
import { toPublisherResponse } from '../utils/mappers/to-catalog-reference-response.ts';
import { buildPaginationMeta } from '../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../utils/pagination/to-page-request.ts';
import {
  buildDisableStatusChange,
  buildReactivateStatusChange,
} from '../utils/records/build-record-status-change.ts';

// Loads the publisher or fails with 404. Disabled publishers are hidden from non-managers.
const findVisiblePublisherOrThrow = async (
  publisherId: string,
  canSeeDisabledRecords = true,
): Promise<Publisher> => {
  const publisher = await publisherRepository.findById(publisherId);

  if (!publisher || (!canSeeDisabledRecords && publisher.status === RecordStatus.DISABLED)) {
    throw new NotFoundError('Publisher not found');
  }

  return publisher;
};

export const publisherService = {
  async listPublishers(
    query: NamedRecordListQueryInput,
    canSeeDisabledRecords: boolean,
  ): Promise<PaginatedResult<PublisherRecordResponse>> {
    const { publishers, totalItems } = await publisherRepository.findPage({
      ...toPageRequest(query.page, query.pageSize),
      search: query.search,
      status: resolveVisibleRecordStatus(query.status, canSeeDisabledRecords),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: publishers.map(toPublisherResponse),
      meta: buildPaginationMeta(query.page, query.pageSize, totalItems),
    };
  },

  async getPublisher(
    publisherId: string,
    canSeeDisabledRecords: boolean,
  ): Promise<PublisherRecordResponse> {
    return toPublisherResponse(
      await findVisiblePublisherOrThrow(publisherId, canSeeDisabledRecords),
    );
  },

  async createPublisher(
    actingUser: AuthenticatedUser,
    details: PublisherDetailsInput,
  ): Promise<PublisherRecordResponse> {
    const createdPublisher = await runInDatabaseTransaction(async (transactionClient) => {
      const publisher = await publisherRepository.create(details, actingUser.id, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.PUBLISHER_CREATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.PUBLISHER,
          affectedRecordId: publisher.id,
          newValue: toPublisherResponse(publisher),
        },
        transactionClient,
      );

      return publisher;
    });

    return toPublisherResponse(createdPublisher);
  },

  async updatePublisher(
    actingUser: AuthenticatedUser,
    publisherId: string,
    details: PublisherDetailsInput,
  ): Promise<PublisherRecordResponse> {
    const publisherBeforeUpdate = await findVisiblePublisherOrThrow(publisherId);

    const updatedPublisher = await runInDatabaseTransaction(async (transactionClient) => {
      const publisher = await publisherRepository.update(publisherId, details, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.PUBLISHER_UPDATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.PUBLISHER,
          affectedRecordId: publisherId,
          previousValue: toPublisherResponse(publisherBeforeUpdate),
          newValue: toPublisherResponse(publisher),
        },
        transactionClient,
      );

      return publisher;
    });

    return toPublisherResponse(updatedPublisher);
  },

  async disablePublisher(
    actingUser: AuthenticatedUser,
    publisherId: string,
  ): Promise<PublisherRecordResponse> {
    const publisher = await findVisiblePublisherOrThrow(publisherId);

    if (publisher.status === RecordStatus.DISABLED) {
      throw new ConflictError('Publisher is already disabled');
    }

    const disabledPublisher = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedPublisher = await publisherRepository.updateStatus(
        publisherId,
        buildDisableStatusChange(actingUser.id),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.PUBLISHER_DISABLED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.PUBLISHER,
          affectedRecordId: publisherId,
          previousValue: { status: publisher.status },
          newValue: { status: updatedPublisher.status },
        },
        transactionClient,
      );

      return updatedPublisher;
    });

    return toPublisherResponse(disabledPublisher);
  },

  async reactivatePublisher(
    actingUser: AuthenticatedUser,
    publisherId: string,
  ): Promise<PublisherRecordResponse> {
    const publisher = await findVisiblePublisherOrThrow(publisherId);

    if (publisher.status === RecordStatus.ACTIVE) {
      throw new ConflictError('Publisher is already active');
    }

    const reactivatedPublisher = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedPublisher = await publisherRepository.updateStatus(
        publisherId,
        buildReactivateStatusChange(),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.PUBLISHER_REACTIVATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.PUBLISHER,
          affectedRecordId: publisherId,
          previousValue: { status: publisher.status },
          newValue: { status: updatedPublisher.status },
        },
        transactionClient,
      );

      return updatedPublisher;
    });

    return toPublisherResponse(reactivatedPublisher);
  },
};
