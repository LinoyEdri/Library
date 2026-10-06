// Israeli date and time format, e.g. "05.10.2026, 14:30"
const hebrewDateTimeFormatter = new Intl.DateTimeFormat('he-IL', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const formatDateTime = (isoDate: string): string =>
  hebrewDateTimeFormatter.format(new Date(isoDate));
