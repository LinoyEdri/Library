import { HebrewTexts } from '../../constants/hebrew-texts';

// "address.city" -> "כתובת · עיר"; unknown field names are shown as they are
export const getAuditFieldLabel = (fieldPath: string): string =>
  fieldPath
    .split('.')
    .map((fieldName) => HebrewTexts.auditFieldLabels[fieldName] ?? fieldName)
    .join(' · ');
