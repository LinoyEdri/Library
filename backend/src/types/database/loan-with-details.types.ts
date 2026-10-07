import type { Prisma } from '@prisma/client';

const personSummary = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
  },
} as const;

// What the loan repository loads with every loan: member, copy + book, and who acted on it
export const includeLoanDetails = {
  member: {
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  bookCopy: {
    include: {
      book: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
        },
      },
    },
  },
  createdBy: personSummary,
  returnProcessedBy: personSummary,
} as const satisfies Prisma.LoanInclude;

export type LoanWithDetails = Prisma.LoanGetPayload<{ include: typeof includeLoanDetails }>;
