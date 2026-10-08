import type { AuditReferencedRecords } from '../../types/database/audit-referenced-records.types.ts';

const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

// "id -> readable name" for every looked-up record (a setting is named by its key)
export const buildAuditReferenceNames = (
  records: AuditReferencedRecords,
): Record<string, string> => {
  const namedRecords: [string, string][] = [
    ...records.users.map((user): [string, string] => [user.id, toPersonName(user)]),
    ...records.members.map((member): [string, string] => [member.id, toPersonName(member.user)]),
    ...records.addresses.map((address): [string, string] => [
      address.id,
      `${address.street} ${address.houseNumber}, ${address.city}`,
    ]),
    ...records.books.map((book): [string, string] => [book.id, book.title]),
    ...records.bookCopies.map((copy): [string, string] => [
      copy.id,
      `${copy.barcode} · ${copy.book.title}`,
    ]),
    ...records.authors.map((author): [string, string] => [author.id, toPersonName(author)]),
    ...records.publishers.map((publisher): [string, string] => [publisher.id, publisher.name]),
    ...records.categories.map((category): [string, string] => [category.id, category.name]),
    ...records.loans.map((loan): [string, string] => [
      loan.id,
      `${loan.bookCopy.book.title} · ${toPersonName(loan.member.user)}`,
    ]),
    ...records.systemSettings.map((setting): [string, string] => [setting.id, setting.key]),
  ];

  return Object.fromEntries(namedRecords);
};
