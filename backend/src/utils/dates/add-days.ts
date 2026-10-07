// The same moment the given number of calendar days later (or earlier, when negative)
export const addDays = (date: Date, days: number): Date => {
  const shiftedDate = new Date(date);

  shiftedDate.setDate(shiftedDate.getDate() + days);

  return shiftedDate;
};
