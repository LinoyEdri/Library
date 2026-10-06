import type {
  AuthorDetailsInput,
  AuthorResponse,
  CategoryDetailsInput,
  CategoryResponse,
  PublisherDetailsInput,
  PublisherResponse,
} from '@library/shared';
import { createCatalogReferenceApi } from './create-catalog-reference-api';

// API calls for /authors, /publishers and /categories
export const authorsApi = createCatalogReferenceApi<AuthorResponse, AuthorDetailsInput>('/authors');

export const publishersApi = createCatalogReferenceApi<PublisherResponse, PublisherDetailsInput>(
  '/publishers',
);

export const categoriesApi = createCatalogReferenceApi<CategoryResponse, CategoryDetailsInput>(
  '/categories',
);
