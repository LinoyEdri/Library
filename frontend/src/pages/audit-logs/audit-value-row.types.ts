// One field in the "before / after" table of an audit entry
export interface AuditValueComparisonRow {
  fieldPath: string;
  fieldLabel: string;
  previousText: string;
  newText: string;
  isChanged: boolean;
}

// One "field: value" line of an entry's additional context
export interface AuditContextRow {
  fieldPath: string;
  fieldLabel: string;
  valueText: string;
}
