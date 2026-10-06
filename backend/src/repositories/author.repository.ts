import type { Author, Prisma, RecordStatus } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import type { AuthorPageFilters } from '../types/database/catalog-reference-filters.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { RecordStatusChange } from '../types/database/record-status-change.types.ts';
import type { AuthorDetailsInput } from '../types/requests/catalog-reference.requests.types.ts';
import { InternalError } from '../types/errors/InternalError.ts';

export const authorRepository = {
  // One page of authors plus the total count, read in one transaction
  async findPage(filters: AuthorPageFilters): Promise<{ authors: Author[]; totalItems: number }> {
    const where: Prisma.AuthorWhereInput = {
      status: filters.status,
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    try {
      const [authors, totalItems] = await prisma.$transaction([
        prisma.author.findMany({
          where,
          orderBy: { [filters.sortBy]: filters.sortOrder },
          skip: filters.skip,
          take: filters.take,
        }),
        prisma.author.count({ where }),
      ]);

      return { authors, totalItems };
    } catch {
      throw new InternalError('Failed to load authors');
    }
  },

  async findById(id: string): Promise<Author | null> {
    try {
      return await prisma.author.findUnique({ where: { id } });
    } catch {
      throw new InternalError('Failed to load author');
    }
  },

  // Id and status of each requested author that exists (used to validate book references)
  async findStatusesByIds(ids: string[]): Promise<{ id: string; status: RecordStatus }[]> {
    try {
      return await prisma.author.findMany({
        where: { id: { in: ids } },
        select: { id: true, status: true },
      });
    } catch {
      throw new InternalError('Failed to load authors');
    }
  },

  async create(
    details: AuthorDetailsInput,
    createdByUserId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Author> {
    try {
      return await databaseClient.author.create({
        data: { ...details, createdByUserId },
      });
    } catch {
      throw new InternalError('Failed to create author');
    }
  },

  async update(
    id: string,
    details: AuthorDetailsInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Author> {
    try {
      return await databaseClient.author.update({ where: { id }, data: details });
    } catch {
      throw new InternalError('Failed to update author');
    }
  },

  async updateStatus(
    id: string,
    statusChange: RecordStatusChange,
    databaseClient: DatabaseClient = prisma,
  ): Promise<Author> {
    try {
      return await databaseClient.author.update({ where: { id }, data: statusChange });
    } catch {
      throw new InternalError('Failed to change author status');
    }
  },
};
