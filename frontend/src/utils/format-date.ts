// Israeli date format without the time, e.g. "05.10.2026"
const hebrewDateFormatter = new Intl.DateTimeFormat('he-IL', {
  dateStyle: 'short',
});

export const formatDate = (isoDate: string): string =>
  hebrewDateFormatter.format(new Date(isoDate));
