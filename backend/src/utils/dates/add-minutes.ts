const MILLISECONDS_PER_MINUTE = 60 * 1000;

// The moment the given number of minutes later
export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * MILLISECONDS_PER_MINUTE);
