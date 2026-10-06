import type { Prisma, Publisher } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import type { NamedRecordPageFilters } from '../types/database/catalog-reference-filters.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { RecordStatusChange } from '../types/database/record-status-change.types.ts';
import type { PublisherDetailsInput } from '../types/requests/catalog-reference.requests.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { InternalError } from '../types/errors/InternalError.ts';
import { isUniqueConstraintViolation } from '../utils/prisma/is-unique-constraint-violation.ts';

const DUPLICATE_PUBLISHER_NAME_MESSAGE = 'A publisher with this name already exists';

export const publisherRepository = {
  // One page of publishers plus the total count, read in one transaction
  async findPage(
    filters: NamedRecordPageFilters,
  ): Promise<{ publishers: Publisher[]; totalItems: number }> {
    const where: Prisma.PublisherWhereInput = {
      status: filters.status,
      ...(filters.search && { name: { contains: filters.search, mode: 'insensitive' } }),
    };

    try {
      const [publishers, totalItems] = await prisma.$transaction([
        prisma.publisher.findMany({
          where,
          orderBy: { [filters.sortBy]: filters.sortOrder },
          skip: filters.skip,
          take: filters.take,
        }),
        prisma.publisher.count({ where }),
      ]);

      return { publishers, totalItems };
    } catch {
      throw new InternalError('Failed to load publishers');
    }
  },

  async findById(id: string): Promise<Publisher | null> {
    try {
      return await prisma.publisher.findUnique({ where: { id } });
    } catch {
      throw new InternalError('Failed to load publisher');
    }
  },

  async create(
    details: PublisherDetailsInput,
    createdByUserId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Publisher> {
    try {
      return await databaseClient.publisher.create({
        data: { ...details, createdByUserId },
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(DUPLICATE_PUBLISHER_NAME_MESSAGE);
      }

      throw new InternalError('Failed to create publisher');
    }
  },

  async update(
    id: string,
    details: PublisherDetailsInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Publisher> {
    try {
      return await databaseClient.publisher.update({ where: { id }, data: details });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(DUPLICATE_PUBLISHER_NAME_MESSAGE);
      }

      throw new InternalError('Failed to update publisher');
    }
  },

  async updateStatus(
    id: string,
    statusChange: RecordStatusChange,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Publisher> {
    try {
      return await databaseClient.publisher.update({ where: { id }, data: statusChange });
    } catch {
      throw new InternalError('Failed to change publisher status');
    }
  },
};
