// Midnight (server local time) of the given day, for "today" counts
export const getStartOfDay = (date: Date): Date => {
  const startOfDay = new Date(date);

  startOfDay.setHours(0, 0, 0, 0);

  return startOfDay;
};
