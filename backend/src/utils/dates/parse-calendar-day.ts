// "2026-10-07" -> local midnight of that day (server time, like the dashboard's "today")
export const parseCalendarDay = (calendarDay: string): Date => {
  const [year, month, day] = calendarDay.split('-').map(Number);

  return new Date(year, month - 1, day);
};
