import type { ActionType, EntityType } from '@prisma/client';
import type { PageRequest } from './page-request.types.ts';

// Filters of the audit log list; the dates are already turned into a [from, before) range
export interface AuditLogPageFilters extends PageRequest {
  actionType?: ActionType;
  affectedType?: EntityType;
  actionUserId?: string;
  entryNumber?: number;
  affectedRecordId?: string;
  createdFrom?: Date;
  createdBefore?: Date;
  sortOrder: 'asc' | 'desc';
}
