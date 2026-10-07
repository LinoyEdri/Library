import { SystemSettingKey } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Setting keys shown by their Hebrew title, e.g. "loanPeriodDays" -> "תקופת השאלה"
const settingTitleByKey: Record<string, string> = Object.fromEntries(
  Object.values(SystemSettingKey).map((settingKey) => [
    settingKey,
    HebrewTexts.settings.definitions[settingKey].title,
  ]),
);

// Every stored code that has a Hebrew name: statuses, roles, reasons, sources, setting keys
const hebrewLabelByStoredValue: Record<string, string> = {
  ...HebrewTexts.loanStatuses,
  ...HebrewTexts.copyStatuses,
  ...HebrewTexts.roles,
  ...HebrewTexts.recordStatuses,
  ...HebrewTexts.auditContextValues,
  ...settingTitleByKey,
};

// A stored text in Hebrew: a record id becomes the record's name, a known code its Hebrew label
export const translateStoredValue = (
  storedText: string,
  referenceNames: Record<string, string> = {},
): string => {
  const recordName = referenceNames[storedText];

  return hebrewLabelByStoredValue[recordName ?? storedText] ?? recordName ?? storedText;
};
