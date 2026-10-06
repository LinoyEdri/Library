import { ActionType, EntityType, RecordStatus, type Category } from '@prisma/client';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { categoryRepository } from '../repositories/category.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type {
  CategoryDetailsInput,
  NamedRecordListQueryInput,
} from '../types/requests/catalog-reference.requests.types.ts';
import type { CategoryRecordResponse } from '../types/responses/catalog-reference.response.types.ts';
import type { PaginatedResult } from '../types/responses/paginated-result.response.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { resolveVisibleRecordStatus } from '../utils/authorization/resolve-visible-record-status.ts';
import { toCategoryResponse } from '../utils/mappers/to-catalog-reference-response.ts';
import { buildPaginationMeta } from '../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../utils/pagination/to-page-request.ts';
import {
  buildDisableStatusChange,
  buildReactivateStatusChange,
} from '../utils/records/build-record-status-change.ts';

// Loads the category or fails with 404. Disabled categories are hidden from non-managers.
const findVisibleCategoryOrThrow = async (
  categoryId: string,
  canSeeDisabledRecords = true,
): Promise<Category> => {
  const category = await categoryRepository.findById(categoryId);

  if (!category || (!canSeeDisabledRecords && category.status === RecordStatus.DISABLED)) {
    throw new NotFoundError('Category not found');
  }

  return category;
};

export const categoryService = {
  async listCategories(
    query: NamedRecordListQueryInput,
    canSeeDisabledRecords: boolean,
  ): Promise<PaginatedResult<CategoryRecordResponse>> {
    const { categories, totalItems } = await categoryRepository.findPage({
      ...toPageRequest(query.page, query.pageSize),
      search: query.search,
      status: resolveVisibleRecordStatus(query.status, canSeeDisabledRecords),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: categories.map(toCategoryResponse),
      meta: buildPaginationMeta(query.page, query.pageSize, totalItems),
    };
  },

  async getCategory(
    categoryId: string,
    canSeeDisabledRecords: boolean,
  ): Promise<CategoryRecordResponse> {
    return toCategoryResponse(await findVisibleCategoryOrThrow(categoryId, canSeeDisabledRecords));
  },

  async createCategory(
    actingUser: AuthenticatedUser,
    details: CategoryDetailsInput,
  ): Promise<CategoryRecordResponse> {
    const createdCategory = await runInDatabaseTransaction(async (transactionClient) => {
      const category = await categoryRepository.create(details, actingUser.id, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.CATEGORY_CREATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.CATEGORY,
          affectedRecordId: category.id,
          newValue: toCategoryResponse(category),
        },
        transactionClient,
      );

      return category;
    });

    return toCategoryResponse(createdCategory);
  },

  async updateCategory(
    actingUser: AuthenticatedUser,
    categoryId: string,
    details: CategoryDetailsInput,
  ): Promise<CategoryRecordResponse> {
    const categoryBeforeUpdate = await findVisibleCategoryOrThrow(categoryId);

    const updatedCategory = await runInDatabaseTransaction(async (transactionClient) => {
      const category = await categoryRepository.update(categoryId, details, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.CATEGORY_UPDATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.CATEGORY,
          affectedRecordId: categoryId,
          previousValue: toCategoryResponse(categoryBeforeUpdate),
          newValue: toCategoryResponse(category),
        },
        transactionClient,
      );

      return category;
    });

    return toCategoryResponse(updatedCategory);
  },

  async disableCategory(
    actingUser: AuthenticatedUser,
    categoryId: string,
  ): Promise<CategoryRecordResponse> {
    const category = await findVisibleCategoryOrThrow(categoryId);

    if (category.status === RecordStatus.DISABLED) {
      throw new ConflictError('Category is already disabled');
    }

    const disabledCategory = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedCategory = await categoryRepository.updateStatus(
        categoryId,
        buildDisableStatusChange(actingUser.id),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.CATEGORY_DISABLED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.CATEGORY,
          affectedRecordId: categoryId,
          previousValue: { status: category.status },
          newValue: { status: updatedCategory.status },
        },
        transactionClient,
      );

      return updatedCategory;
    });

    return toCategoryResponse(disabledCategory);
  },

  async reactivateCategory(
    actingUser: AuthenticatedUser,
    categoryId: string,
  ): Promise<CategoryRecordResponse> {
    const category = await findVisibleCategoryOrThrow(categoryId);

    if (category.status === RecordStatus.ACTIVE) {
      throw new ConflictError('Category is already active');
    }

    const reactivatedCategory = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedCategory = await categoryRepository.updateStatus(
        categoryId,
        buildReactivateStatusChange(),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.CATEGORY_REACTIVATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.CATEGORY,
          affectedRecordId: categoryId,
          previousValue: { status: category.status },
          newValue: { status: updatedCategory.status },
        },
        transactionClient,
      );

      return updatedCategory;
    });

    return toCategoryResponse(reactivatedCategory);
  },
};
