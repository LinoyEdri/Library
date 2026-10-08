import { LoanStatus, type Prisma } from '@prisma/client';
import type { LibraryLoanStatistics } from '@library/shared';
import prisma from '../prisma/prisma.ts';
import { OPEN_LOAN_STATUSES } from '../constants/loan-statuses.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { LoanPageFilters } from '../types/database/loan-filters.types.ts';
import {
  includeLoanDetails,
  type LoanWithDetails,
} from '../types/database/loan-with-details.types.ts';
import { InternalError } from '../types/errors/InternalError.ts';
import { splitSearchWords } from '../utils/search/split-search-words.ts';

// One search word must match the book title, the copy barcode or the member's name/email
const buildLoanSearchWordFilter = (searchWord: string): Prisma.LoanWhereInput => ({
  OR: [
    { bookCopy: { book: { title: { contains: searchWord, mode: 'insensitive' } } } },
    { bookCopy: { barcode: { contains: searchWord, mode: 'insensitive' } } },
    {
      member: {
        user: {
          OR: [
            { firstName: { contains: searchWord, mode: 'insensitive' } },
            { lastName: { contains: searchWord, mode: 'insensitive' } },
            { email: { contains: searchWord, mode: 'insensitive' } },
          ],
        },
      },
    },
  ],
});

const buildLoanWhere = (filters: LoanPageFilters): Prisma.LoanWhereInput => ({
  status: filters.status,
  memberId: filters.memberId,
  ...(filters.bookId && { bookCopy: { bookId: filters.bookId } }),
  AND: [
    ...splitSearchWords(filters.search).map(buildLoanSearchWordFilter),
    ...(filters.onlyOverdue
      ? [{ status: { in: OPEN_LOAN_STATUSES }, dueDate: { lt: new Date() } }]
      : []),
  ],
});

export const loanRepository = {
  // One page of loans plus the total count
  async findPage(
    filters: LoanPageFilters,
  ): Promise<{ loans: LoanWithDetails[]; totalItems: number }> {
    const where = buildLoanWhere(filters);

    try {
      const [loans, totalItems] = await prisma.$transaction([
        prisma.loan.findMany({
          where,
          include: includeLoanDetails,
          orderBy: [{ [filters.sortBy]: filters.sortOrder }, { id: 'desc' }],
          skip: filters.skip,
          take: filters.take,
        }),
        prisma.loan.count({ where }),
      ]);

      return { loans, totalItems };
    } catch {
      throw new InternalError('Failed to load loans');
    }
  },

  async findById(id: string): Promise<LoanWithDetails | null> {
    try {
      return await prisma.loan.findUnique({ where: { id }, include: includeLoanDetails });
    } catch {
      throw new InternalError('Failed to load loan');
    }
  },

  // Loans the member still holds (active, overdue or waiting for a return)
  async countOpenLoansForMember(
    memberId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<number> {
    try {
      return await databaseClient.loan.count({
        where: { memberId, status: { in: OPEN_LOAN_STATUSES } },
      });
    } catch {
      throw new InternalError('Failed to count member loans');
    }
  },

  // Active loans whose due date has passed (to be marked overdue)
  async findActiveLoansPastDue(now: Date): Promise<{ id: string; dueDate: Date }[]> {
    try {
      return await prisma.loan.findMany({
        where: { status: LoanStatus.ACTIVE, dueDate: { lt: now } },
        select: { id: true, dueDate: true },
      });
    } catch {
      throw new InternalError('Failed to load past-due loans');
    }
  },

  async create(
    loan: Prisma.LoanUncheckedCreateInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<LoanWithDetails> {
    try {
      return await databaseClient.loan.create({ data: loan, include: includeLoanDetails });
    } catch {
      throw new InternalError('Failed to create loan');
    }
  },

  async update(
    id: string,
    changes: Prisma.LoanUncheckedUpdateInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<LoanWithDetails> {
    try {
      return await databaseClient.loan.update({
        where: { id },
        data: changes,
        include: includeLoanDetails,
      });
    } catch {
      throw new InternalError('Failed to update loan');
    }
  },

  // Library-wide loan counts for the staff dashboard
  async countLibraryStatistics(now: Date, startOfToday: Date): Promise<LibraryLoanStatistics> {
    try {
      const [openLoans, overdueLoans, pendingReturns, loansCreatedToday, returnsProcessedToday] =
        await prisma.$transaction([
          prisma.loan.count({ where: { status: { in: OPEN_LOAN_STATUSES } } }),
          prisma.loan.count({
            where: { status: { in: OPEN_LOAN_STATUSES }, dueDate: { lt: now } },
          }),
          prisma.loan.count({ where: { status: LoanStatus.RETURN_REQUESTED } }),
          prisma.loan.count({ where: { createdDate: { gte: startOfToday } } }),
          prisma.loan.count({ where: { returnProcessedDate: { gte: startOfToday } } }),
        ]);

      return { openLoans, overdueLoans, pendingReturns, loansCreatedToday, returnsProcessedToday };
    } catch {
      throw new InternalError('Failed to count loans');
    }
  },

  // The member's open, late and waiting-for-return loan counts
  async countMemberStatistics(
    memberId: string,
    now: Date,
  ): Promise<{ openLoans: number; overdueLoans: number; pendingReturns: number }> {
    try {
      const [openLoans, overdueLoans, pendingReturns] = await prisma.$transaction([
        prisma.loan.count({ where: { memberId, status: { in: OPEN_LOAN_STATUSES } } }),
        prisma.loan.count({
          where: { memberId, status: { in: OPEN_LOAN_STATUSES }, dueDate: { lt: now } },
        }),
        prisma.loan.count({ where: { memberId, status: LoanStatus.RETURN_REQUESTED } }),
      ]);

      return { openLoans, overdueLoans, pendingReturns };
    } catch {
      throw new InternalError('Failed to count member loans');
    }
  },

  // Every loan the member still holds, nearest due date first
  async findOpenLoansOfMember(memberId: string): Promise<LoanWithDetails[]> {
    try {
      return await prisma.loan.findMany({
        where: { memberId, status: { in: OPEN_LOAN_STATUSES } },
        include: includeLoanDetails,
        orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
      });
    } catch {
      throw new InternalError('Failed to load member loans');
    }
  },
};
