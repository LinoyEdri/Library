import type { AuditValueComparisonRow } from '../../pages/audit-logs/audit-value-row.types';
import { flattenAuditValue } from './flatten-audit-value';
import { formatAuditValue } from './format-audit-value';
import { getAuditFieldLabel } from './get-audit-field-label';

// Every field found before or after the action, with both values; changed fields are marked
export const buildAuditValueComparisonRows = (
  previousValue: unknown,
  newValue: unknown,
  referenceNames: Record<string, string>,
): AuditValueComparisonRow[] => {
  const previousFields = flattenAuditValue(previousValue);
  const newFields = flattenAuditValue(newValue);

  const fieldPaths = [...new Set([...Object.keys(previousFields), ...Object.keys(newFields)])];

  return fieldPaths.map((fieldPath) => {
    const previousText = formatAuditValue(previousFields[fieldPath], referenceNames);
    const newText = formatAuditValue(newFields[fieldPath], referenceNames);

    return {
      fieldPath,
      fieldLabel: getAuditFieldLabel(fieldPath),
      previousText,
      newText,
      isChanged: previousText !== newText,
    };
  });
};
