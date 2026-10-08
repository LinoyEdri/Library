// "First Last, First Last" for a book's authors (primary author first, as sent by the API)
export const formatAuthorNames = (authors: { firstName: string; lastName: string }[]): string =>
  authors.map((author) => `${author.firstName} ${author.lastName}`).join(', ');
