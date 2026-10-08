import type { AuditContextRow } from '../../pages/audit-logs/audit-value-row.types';
import { flattenAuditValue } from './flatten-audit-value';
import { formatAuditValue } from './format-audit-value';
import { getAuditFieldLabel } from './get-audit-field-label';

// The entry's additional context (e.g. source, reason) as labelled Hebrew lines
export const buildAuditContextRows = (
  additionalContext: unknown,
  referenceNames: Record<string, string>,
): AuditContextRow[] =>
  Object.entries(flattenAuditValue(additionalContext)).map(([fieldPath, value]) => ({
    fieldPath,
    fieldLabel: getAuditFieldLabel(fieldPath),
    valueText: formatAuditValue(value, referenceNames),
  }));
