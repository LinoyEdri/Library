import type { ActionType, AuditLogEntryResponse, EntityType } from '@library/shared';
import { sendApiRequest, sendPaginatedApiRequest } from './api-client';

// Query string of GET /audit-logs (dates are whole days, e.g. "2026-10-07")
export interface AuditLogListParams {
  page: number;
  pageSize: number;
  actionType?: ActionType;
  affectedType?: EntityType;
  actionUserId?: string;
  entryNumber?: number;
  affectedRecordId?: string;
  fromDate?: string;
  toDate?: string;
  sortOrder?: 'asc' | 'desc';
}

// Calls to /audit-logs (admin, read only)
export const auditLogsApi = {
  list: (params: AuditLogListParams) =>
    sendPaginatedApiRequest<AuditLogEntryResponse>({ method: 'GET', url: '/audit-logs', params }),

  getEntry: (entryId: string) =>
    sendApiRequest<AuditLogEntryResponse>({ method: 'GET', url: `/audit-logs/${entryId}` }),
};
