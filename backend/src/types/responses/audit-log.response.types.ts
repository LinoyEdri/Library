import type { Prisma } from '@prisma/client';
import type { DashboardAuditEntryRecord } from './dashboard.response.types.ts';

// One audit entry with its stored JSON values and the names of the records it mentions
// (Date objects; sent as ISO strings)
export interface AuditLogEntryRecord extends DashboardAuditEntryRecord {
  entryNumber: number;
  affectedRecordName: string | null;
  previousValue: Prisma.JsonValue | null;
  newValue: Prisma.JsonValue | null;
  additionalContext: Prisma.JsonValue | null;
  referenceNames: Record<string, string>;
}
