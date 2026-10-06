import type { RecordStatus } from '@prisma/client';
import type { PageRequest } from './page-request.types.ts';

// Filters for a page of authors
export interface AuthorPageFilters extends PageRequest {
  search?: string;
  status?: RecordStatus;
  sortBy: 'lastName' | 'firstName' | 'createdDate';
  sortOrder: 'asc' | 'desc';
}

// Filters for a page of publishers or categories (records that have a name)
export interface NamedRecordPageFilters extends PageRequest {
  search?: string;
  status?: RecordStatus;
  sortBy: 'name' | 'createdDate';
  sortOrder: 'asc' | 'desc';
}
