import type { AuditLogEntryResponse } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { translateStoredValue } from './translate-stored-value';

// The changed record by name (a setting by its Hebrew title); "—" when it cannot be named
export const getAuditRecordLabel = (entry: AuditLogEntryResponse): string =>
  entry.affectedRecordName
    ? translateStoredValue(entry.affectedRecordName)
    : HebrewTexts.auditLogs.missingValue;
