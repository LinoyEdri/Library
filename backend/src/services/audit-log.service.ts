import type { AuditLog } from '@prisma/client';
import { auditLogRepository } from '../repositories/audit-log.repository.ts';
import type { AuditLogEntryInput } from '../types/audit/audit-log-entry-input.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import { toAuditJsonValue } from '../utils/audit/to-audit-json-value.ts';

export const auditLogService = {
  // Pass the transaction client so the audit entry commits together with the change itself
  async recordAuditLogEntry(
    entry: AuditLogEntryInput,
    databaseClient?: DatabaseClient,
  ): Promise<AuditLog> {
    return auditLogRepository.createAuditLogEntry(
      {
        actionType: entry.actionType,
        actionUserId: entry.actionUserId,
        actionUserRole: entry.actionUserRole,
        affectedType: entry.affectedType,
        affectedRecordId: entry.affectedRecordId ?? null,
        previousValue: toAuditJsonValue(entry.previousValue),
        newValue: toAuditJsonValue(entry.newValue),
        additionalContext: toAuditJsonValue(entry.additionalContext),
      },
      databaseClient,
    );
  },
};
