import { CopyStatus, type BookCopy } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import type { CopyStatusChange } from '../types/database/copy-status-change.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { InternalError } from '../types/errors/InternalError.ts';
import { isUniqueConstraintViolation } from '../utils/prisma/is-unique-constraint-violation.ts';

export const bookCopyRepository = {
  async findById(id: string): Promise<BookCopy | null> {
    try {
      return await prisma.bookCopy.findUnique({ where: { id } });
    } catch {
      throw new InternalError('Failed to load book copy');
    }
  },

  async findByBarcode(barcode: string): Promise<BookCopy | null> {
    try {
      return await prisma.bookCopy.findUnique({ where: { barcode } });
    } catch {
      throw new InternalError('Failed to load book copy');
    }
  },

  // Oldest available copy of the book (by barcode), or null when every copy is taken
  async findFirstAvailableCopyOfBook(
    bookId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<BookCopy | null> {
    try {
      return await databaseClient.bookCopy.findFirst({
        where: { bookId, status: CopyStatus.AVAILABLE },
        orderBy: { barcode: 'asc' },
      });
    } catch {
      throw new InternalError('Failed to find an available copy');
    }
  },

  // Flips AVAILABLE -> ON_LOAN only if the copy is still available, so two loans can never
  // take the same copy at once. Returns false when someone else got it first.
  async reserveCopyIfAvailable(
    copyId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<boolean> {
    try {
      const { count } = await databaseClient.bookCopy.updateMany({
        where: { id: copyId, status: CopyStatus.AVAILABLE },
        data: { status: CopyStatus.ON_LOAN },
      });

      return count === 1;
    } catch {
      throw new InternalError('Failed to reserve the copy');
    }
  },

  async findByBookId(bookId: string): Promise<BookCopy[]> {
    try {
      return await prisma.bookCopy.findMany({ where: { bookId }, orderBy: { barcode: 'asc' } });
    } catch {
      throw new InternalError('Failed to load book copies');
    }
  },

  // Number of copies per book and status, for the available/total counts
  async countByBookAndStatus(
    bookIds: string[],
  ): Promise<{ bookId: string; status: CopyStatus; copyCount: number }[]> {
    if (bookIds.length === 0) {
      return [];
    }

    try {
      const groups = await prisma.bookCopy.groupBy({
        by: ['bookId', 'status'],
        where: { bookId: { in: bookIds } },
        _count: { _all: true },
      });

      return groups.map((group) => ({
        bookId: group.bookId,
        status: group.status,
        copyCount: group._count._all,
      }));
    } catch {
      throw new InternalError('Failed to count book copies');
    }
  },

  async create(
    bookId: string,
    barcode: string,
    createdByUserId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<BookCopy> {
    try {
      return await databaseClient.bookCopy.create({ data: { bookId, barcode, createdByUserId } });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError('A copy with this barcode already exists');
      }

      throw new InternalError('Failed to create book copy');
    }
  },

  async updateStatus(
    id: string,
    statusChange: CopyStatusChange['data'],
    databaseClient: DatabaseClient = prisma,
  ): Promise<BookCopy> {
    try {
      return await databaseClient.bookCopy.update({ where: { id }, data: statusChange });
    } catch {
      throw new InternalError('Failed to change book copy status');
    }
  },
};
