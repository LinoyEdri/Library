import type { Author, Category, Publisher } from '@prisma/client';
import type {
  AuthorRecordResponse,
  CategoryRecordResponse,
  PublisherRecordResponse,
} from '../../types/responses/catalog-reference.response.types.ts';

// Explicit mappings: internal columns (created/disabled by user ids) are not sent to clients

export const toAuthorResponse = (author: Author): AuthorRecordResponse => ({
  id: author.id,
  firstName: author.firstName,
  lastName: author.lastName,
  biography: author.biography,
  status: author.status,
  createdDate: author.createdDate,
  updatedDate: author.updatedDate,
  disabledDate: author.disabledDate,
});

export const toPublisherResponse = (publisher: Publisher): PublisherRecordResponse => ({
  id: publisher.id,
  name: publisher.name,
  description: publisher.description,
  status: publisher.status,
  createdDate: publisher.createdDate,
  updatedDate: publisher.updatedDate,
  disabledDate: publisher.disabledDate,
});

export const toCategoryResponse = (category: Category): CategoryRecordResponse => ({
  id: category.id,
  name: category.name,
  status: category.status,
  createdDate: category.createdDate,
  updatedDate: category.updatedDate,
  disabledDate: category.disabledDate,
});
