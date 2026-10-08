import type { BookWithRelations } from '../../types/database/book-with-relations.types.ts';

// The editable book fields, as stored in BOOK_CREATED / BOOK_UPDATED audit entries
export const toBookAuditSnapshot = (book: BookWithRelations) => ({
  title: book.title,
  isbn: book.isbn,
  publisherId: book.publisherId,
  publicationYear: book.publicationYear,
  language: book.language,
  imageUrl: book.imageUrl,
  description: book.description,
  authorIds: book.authors.map((bookAuthor) => bookAuthor.authorId),
  categoryIds: book.categories.map((bookCategory) => bookCategory.categoryId),
});
