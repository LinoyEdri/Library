import type { RecordStatus } from '@prisma/client';
import type { PageRequest } from './page-request.types.ts';

// Filters for a page of members
export interface MemberPageFilters extends PageRequest {
  search?: string;
  status?: RecordStatus;
  sortBy: 'lastName' | 'firstName' | 'registrationDate';
  sortOrder: 'asc' | 'desc';
}
