import type { DashboardAuditEntry } from './dashboard-response.types.js';

// One audit log entry with its stored values (JSON as written: shape differs per action)
export interface AuditLogEntryResponse extends DashboardAuditEntry {
  // Running number shown to people (1, 2, 3...) instead of the technical id
  entryNumber: number;
  // Name of the changed record (book title, member name...), or null when it no longer exists
  affectedRecordName: string | null;
  previousValue: unknown;
  newValue: unknown;
  additionalContext: unknown;
  // Names of every record id found in the stored values (e.g. author ids -> author names)
  referenceNames: Record<string, string>;
}
