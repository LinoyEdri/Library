import type { Category, Prisma } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import type { NamedRecordPageFilters } from '../types/database/catalog-reference-filters.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { RecordStatusChange } from '../types/database/record-status-change.types.ts';
import type { CategoryDetailsInput } from '../types/requests/catalog-reference.requests.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { InternalError } from '../types/errors/InternalError.ts';
import { isUniqueConstraintViolation } from '../utils/prisma/is-unique-constraint-violation.ts';

const DUPLICATE_CATEGORY_NAME_MESSAGE = 'A category with this name already exists';

export const categoryRepository = {
  // One page of categories plus the total count, read in one transaction
  async findPage(
    filters: NamedRecordPageFilters,
  ): Promise<{ categories: Category[]; totalItems: number }> {
    const where: Prisma.CategoryWhereInput = {
      status: filters.status,
      ...(filters.search && { name: { contains: filters.search, mode: 'insensitive' } }),
    };

    try {
      const [categories, totalItems] = await prisma.$transaction([
        prisma.category.findMany({
          where,
          orderBy: { [filters.sortBy]: filters.sortOrder },
          skip: filters.skip,
          take: filters.take,
        }),
        prisma.category.count({ where }),
      ]);

      return { categories, totalItems };
    } catch {
      throw new InternalError('Failed to load categories');
    }
  },

  async findById(id: string): Promise<Category | null> {
    try {
      return await prisma.category.findUnique({ where: { id } });
    } catch {
      throw new InternalError('Failed to load category');
    }
  },

  async create(
    details: CategoryDetailsInput,
    createdByUserId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Category> {
    try {
      return await databaseClient.category.create({
        data: { ...details, createdByUserId },
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(DUPLICATE_CATEGORY_NAME_MESSAGE);
      }

      throw new InternalError('Failed to create category');
    }
  },

  async update(
    id: string,
    details: CategoryDetailsInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Category> {
    try {
      return await databaseClient.category.update({ where: { id }, data: details });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(DUPLICATE_CATEGORY_NAME_MESSAGE);
      }

      throw new InternalError('Failed to update category');
    }
  },

  async updateStatus(
    id: string,
    statusChange: RecordStatusChange,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Category> {
    try {
      return await databaseClient.category.update({ where: { id }, data: statusChange });
    } catch {
      throw new InternalError('Failed to change category status');
    }
  },
};
