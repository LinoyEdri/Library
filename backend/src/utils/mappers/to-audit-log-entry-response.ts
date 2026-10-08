import type { AuditLogWithActor } from '../../types/database/audit-log-with-actor.types.ts';
import type { AuditLogEntryRecord } from '../../types/responses/audit-log.response.types.ts';
import { collectAuditReferenceIds } from '../audit/collect-audit-reference-ids.ts';
import { toDashboardAuditEntry } from './to-dashboard-audit-entry.ts';

// The full audit entry: summary fields, stored values, and the names of the records it mentions
export const toAuditLogEntryResponse = (
  entry: AuditLogWithActor,
  namesByRecordId: Record<string, string>,
): AuditLogEntryRecord => {
  const referenceNames = Object.fromEntries(
    collectAuditReferenceIds([entry])
      .filter((recordId) => recordId in namesByRecordId)
      .map((recordId) => [recordId, namesByRecordId[recordId]]),
  );

  return {
    ...toDashboardAuditEntry(entry),
    entryNumber: entry.entryNumber,
    affectedRecordName: entry.affectedRecordId
      ? (namesByRecordId[entry.affectedRecordId] ?? null)
      : null,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
    additionalContext: entry.additionalContext,
    referenceNames,
  };
};
