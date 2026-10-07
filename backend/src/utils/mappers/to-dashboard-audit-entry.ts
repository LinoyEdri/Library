import type { AuditLogWithActor } from '../../types/database/audit-log-with-actor.types.ts';
import type { DashboardAuditEntryRecord } from '../../types/responses/dashboard.response.types.ts';

// The audit entry fields shown on the admin dashboard (no previous/new values)
export const toDashboardAuditEntry = (entry: AuditLogWithActor): DashboardAuditEntryRecord => ({
  id: entry.id,
  actionType: entry.actionType,
  affectedType: entry.affectedType,
  affectedRecordId: entry.affectedRecordId,
  createdDate: entry.createdDate,
  actionUserRole: entry.actionUserRole,
  actionUser: entry.actionUser,
});
