import type { AuditLogWithActor } from '../../types/database/audit-log-with-actor.types.ts';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Adds every uuid string found anywhere inside a stored JSON value
const collectUuids = (value: unknown, foundIds: Set<string>): void => {
  if (typeof value === 'string') {
    if (UUID_PATTERN.test(value)) {
      foundIds.add(value);
    }

    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectUuids(item, foundIds));
    return;
  }

  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach((fieldValue) => collectUuids(fieldValue, foundIds));
  }
};

// The ids of every record the entries point at: the changed record and any ids in their values
export const collectAuditReferenceIds = (entries: AuditLogWithActor[]): string[] => {
  const foundIds = new Set<string>();

  for (const entry of entries) {
    collectUuids(entry.affectedRecordId, foundIds);
    collectUuids(entry.previousValue, foundIds);
    collectUuids(entry.newValue, foundIds);
    collectUuids(entry.additionalContext, foundIds);
  }

  return [...foundIds];
};
