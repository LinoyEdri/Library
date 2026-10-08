import { HebrewTexts } from '../../constants/hebrew-texts';
import { formatDateTime } from '../format-date-time';
import { translateStoredValue } from './translate-stored-value';

const { auditLogs: texts } = HebrewTexts;

const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

// One stored value as readable Hebrew text ("—" when the field is not there at all).
// Record ids become names (from the entry's referenceNames); codes become Hebrew labels.
export const formatAuditValue = (
  value: unknown,
  referenceNames: Record<string, string> = {},
): string => {
  if (value === undefined) {
    return texts.missingValue;
  }

  if (value === null || value === '') {
    return texts.emptyValue;
  }

  if (typeof value === 'boolean') {
    return value ? texts.yes : texts.no;
  }

  if (typeof value === 'string') {
    return ISO_DATE_TIME_PATTERN.test(value)
      ? formatDateTime(value)
      : translateStoredValue(value, referenceNames);
  }

  if (Array.isArray(value)) {
    return value.length === 0
      ? texts.emptyValue
      : value.map((item) => formatAuditValue(item, referenceNames)).join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};
