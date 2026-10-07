import type { RecordStatus, Role } from '@prisma/client';
import type { PageRequest } from './page-request.types.ts';

// Filters for a page of users (admin user management)
export interface UserPageFilters extends PageRequest {
  search?: string;
  role?: Role;
  status?: RecordStatus;
  sortBy: 'lastName' | 'firstName' | 'createdDate' | 'lastLoginDate';
  sortOrder: 'asc' | 'desc';
}
