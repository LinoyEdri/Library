import type { LoanStatus } from '@prisma/client';
import type { PageRequest } from './page-request.types.ts';

// Filters for a page of loans (memberId is forced for members)
export interface LoanPageFilters extends PageRequest {
  search?: string;
  status?: LoanStatus;
  memberId?: string;
  bookId?: string;
  onlyOverdue?: boolean;
  sortBy: 'createdDate' | 'dueDate';
  sortOrder: 'asc' | 'desc';
}
