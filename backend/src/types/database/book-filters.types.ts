import type { RecordStatus } from '@prisma/client';
import type { PageRequest } from './page-request.types.ts';

// Filters for a page of books
export interface BookPageFilters extends PageRequest {
  search?: string;
  status?: RecordStatus;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  language?: string;
  availability?: 'available' | 'unavailable';
  sortBy: 'title' | 'publicationYear' | 'createdDate';
  sortOrder: 'asc' | 'desc';
}
