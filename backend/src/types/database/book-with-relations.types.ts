import type { Prisma } from '@prisma/client';

// What the book repository loads with every book: publisher, authors (primary first) and categories
export const includeBookRelations = {
  publisher: {
    select: {
      id: true,
      name: true,
    },
  },
  authors: {
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ isPrimaryAuthor: 'desc' }, { author: { lastName: 'asc' } }],
  },
  categories: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { category: { name: 'asc' } },
  },
} as const satisfies Prisma.BookInclude;

export type BookWithRelations = Prisma.BookGetPayload<{ include: typeof includeBookRelations }>;
