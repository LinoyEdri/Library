import { CopyStatus, RecordStatus, type Prisma } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import type { BookPageFilters } from '../types/database/book-filters.types.ts';
import {
  includeBookRelations,
  type BookWithRelations,
} from '../types/database/book-with-relations.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { RecordStatusChange } from '../types/database/record-status-change.types.ts';
import type { BookDetailsInput } from '../types/requests/book.requests.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { InternalError } from '../types/errors/InternalError.ts';
import { isUniqueConstraintViolation } from '../utils/prisma/is-unique-constraint-violation.ts';

const DUPLICATE_ISBN_MESSAGE = 'A book with this ISBN already exists';

// Builds the WHERE clause for the catalog list from its filters
const buildBookWhere = (filters: BookPageFilters): Prisma.BookWhereInput => ({
  status: filters.status,
  publisherId: filters.publisherId,
  language: filters.language,
  ...(filters.categoryId && { categories: { some: { categoryId: filters.categoryId } } }),
  ...(filters.authorId && { authors: { some: { authorId: filters.authorId } } }),
  ...(filters.availability === 'available' && {
    copies: { some: { status: CopyStatus.AVAILABLE } },
  }),
  ...(filters.availability === 'unavailable' && {
    copies: { none: { status: CopyStatus.AVAILABLE } },
  }),
  ...(filters.search && {
    OR: [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { isbn: { contains: filters.search.replace(/[\s-]/g, '') } },
      {
        authors: {
          some: {
            author: {
              OR: [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
              ],
            },
          },
        },
      },
    ],
  }),
});

// Book columns plus its authors (first = primary) and categories, written in one statement
const toBookWriteData = (details: BookDetailsInput) => ({
  title: details.title,
  isbn: details.isbn,
  publisherId: details.publisherId,
  publicationYear: details.publicationYear,
  language: details.language,
  imageUrl: details.imageUrl,
  description: details.description,
});

const toBookAuthorRows = (authorIds: string[]) =>
  authorIds.map((authorId, index) => ({ authorId, isPrimaryAuthor: index === 0 }));

const toBookCategoryRows = (categoryIds: string[]) =>
  categoryIds.map((categoryId) => ({ categoryId }));

export const bookRepository = {
  // One page of books plus the total count, read in one transaction
  async findPage(
    filters: BookPageFilters,
  ): Promise<{ books: BookWithRelations[]; totalItems: number }> {
    const where = buildBookWhere(filters);

    try {
      const [books, totalItems] = await prisma.$transaction([
        prisma.book.findMany({
          where,
          include: includeBookRelations,
          orderBy: [{ [filters.sortBy]: filters.sortOrder }, { title: 'asc' }],
          skip: filters.skip,
          take: filters.take,
        }),
        prisma.book.count({ where }),
      ]);

      return { books, totalItems };
    } catch {
      throw new InternalError('Failed to load books');
    }
  },

  async findById(id: string): Promise<BookWithRelations | null> {
    try {
      return await prisma.book.findUnique({ where: { id }, include: includeBookRelations });
    } catch {
      throw new InternalError('Failed to load book');
    }
  },

  // Languages used by books with the given status (or all books), for the catalog filter
  async findDistinctLanguages(status?: RecordStatus): Promise<string[]> {
    try {
      const rows = await prisma.book.findMany({
        where: { status },
        select: { language: true },
        distinct: ['language'],
        orderBy: { language: 'asc' },
      });

      return rows.map((row) => row.language);
    } catch {
      throw new InternalError('Failed to load book languages');
    }
  },

  async create(
    details: BookDetailsInput,
    createdByUserId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<BookWithRelations> {
    try {
      return await databaseClient.book.create({
        data: {
          ...toBookWriteData(details),
          createdByUserId,
          authors: { create: toBookAuthorRows(details.authorIds) },
          categories: { create: toBookCategoryRows(details.categoryIds) },
        },
        include: includeBookRelations,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(DUPLICATE_ISBN_MESSAGE);
      }

      throw new InternalError('Failed to create book');
    }
  },

  // Replaces the book's fields, authors and categories
  async update(
    id: string,
    details: BookDetailsInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<BookWithRelations> {
    try {
      return await databaseClient.book.update({
        where: { id },
        data: {
          ...toBookWriteData(details),
          authors: { deleteMany: {}, create: toBookAuthorRows(details.authorIds) },
          categories: { deleteMany: {}, create: toBookCategoryRows(details.categoryIds) },
        },
        include: includeBookRelations,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(DUPLICATE_ISBN_MESSAGE);
      }

      throw new InternalError('Failed to update book');
    }
  },

  async updateStatus(
    id: string,
    statusChange: RecordStatusChange,
    databaseClient: DatabaseClient = prisma,
  ): Promise<BookWithRelations> {
    try {
      return await databaseClient.book.update({
        where: { id },
        data: statusChange,
        include: includeBookRelations,
      });
    } catch {
      throw new InternalError('Failed to change book status');
    }
  },

  // Active books in the catalog (admin dashboard)
  async countActive(): Promise<number> {
    try {
      return await prisma.book.count({ where: { status: RecordStatus.ACTIVE } });
    } catch {
      throw new InternalError('Failed to count books');
    }
  },
};
