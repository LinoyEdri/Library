import type { AuditLogEntryResponse } from '@library/shared';
import { buildAuditContextRows } from '../../../utils/audit/build-audit-context-rows';
import { buildAuditValueComparisonRows } from '../../../utils/audit/build-audit-value-comparison-rows';
import { getAuditRecordLabel } from '../../../utils/audit/get-audit-record-label';

// The opened entry's record name, "before / after" rows and additional context rows
export const useAuditLogEntryDrawer = (entry: AuditLogEntryResponse) => ({
  recordLabel: getAuditRecordLabel(entry),
  comparisonRows: buildAuditValueComparisonRows(
    entry.previousValue,
    entry.newValue,
    entry.referenceNames,
  ),
  contextRows: buildAuditContextRows(entry.additionalContext, entry.referenceNames),
});
