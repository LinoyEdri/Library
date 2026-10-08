import type { Prisma } from '@prisma/client';

// Only the fields needed to name each kind of record an audit entry can point at

const personNameSelect = { firstName: true, lastName: true } as const;

export const auditReferencedRecordSelects = {
  user: { id: true, ...personNameSelect },
  member: { id: true, user: { select: personNameSelect } },
  address: { id: true, street: true, houseNumber: true, city: true },
  book: { id: true, title: true },
  bookCopy: { id: true, barcode: true, book: { select: { title: true } } },
  author: { id: true, ...personNameSelect },
  publisher: { id: true, name: true },
  category: { id: true, name: true },
  loan: {
    id: true,
    bookCopy: { select: { book: { select: { title: true } } } },
    member: { select: { user: { select: personNameSelect } } },
  },
  systemSetting: { id: true, key: true },
} satisfies {
  user: Prisma.UserSelect;
  member: Prisma.MemberSelect;
  address: Prisma.AddressSelect;
  book: Prisma.BookSelect;
  bookCopy: Prisma.BookCopySelect;
  author: Prisma.AuthorSelect;
  publisher: Prisma.PublisherSelect;
  category: Prisma.CategorySelect;
  loan: Prisma.LoanSelect;
  systemSetting: Prisma.SystemSettingSelect;
};

type Selects = typeof auditReferencedRecordSelects;

// Every record (of any kind) whose id appears in a page of audit entries
export interface AuditReferencedRecords {
  users: Prisma.UserGetPayload<{ select: Selects['user'] }>[];
  members: Prisma.MemberGetPayload<{ select: Selects['member'] }>[];
  addresses: Prisma.AddressGetPayload<{ select: Selects['address'] }>[];
  books: Prisma.BookGetPayload<{ select: Selects['book'] }>[];
  bookCopies: Prisma.BookCopyGetPayload<{ select: Selects['bookCopy'] }>[];
  authors: Prisma.AuthorGetPayload<{ select: Selects['author'] }>[];
  publishers: Prisma.PublisherGetPayload<{ select: Selects['publisher'] }>[];
  categories: Prisma.CategoryGetPayload<{ select: Selects['category'] }>[];
  loans: Prisma.LoanGetPayload<{ select: Selects['loan'] }>[];
  systemSettings: Prisma.SystemSettingGetPayload<{ select: Selects['systemSetting'] }>[];
}
