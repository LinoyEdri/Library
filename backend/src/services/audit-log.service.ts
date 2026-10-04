import { Prisma, type ActionType, type AuditLog, type EntityType, type Role } from '@prisma/client';
import type { DatabaseClient } from '../prisma/database-client.ts';
import { auditLogRepository } from '../repositories/audit-log.repository.ts';

// Field names that must never be stored in the audit log
const SENSITIVE_FIELD_NAMES = new Set(['passwordHash', 'password']);

// What happened, who did it, and which record it affected
export interface AuditLogEntryInput {
  actionType: ActionType;
  actionUserId: string;
  actionUserRole: Role;
  affectedType: EntityType;
  affectedRecordId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  additionalContext?: unknown;
}

// Converts a value to plain JSON (dates become ISO strings) and drops sensitive fields
const toAuditJsonValue = (value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull => {
  if (value === undefined || value === null) {
    return Prisma.DbNull;
  }

  const jsonText = JSON.stringify(value, (key, fieldValue) =>
    SENSITIVE_FIELD_NAMES.has(key) ? undefined : fieldValue,
  );

  return JSON.parse(jsonText) as Prisma.InputJsonValue;
};

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
