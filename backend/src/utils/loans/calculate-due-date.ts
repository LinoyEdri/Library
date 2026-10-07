const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Due date = loan date + the loan period (in days) from the settings
export const calculateDueDate = (loanDate: Date, loanPeriodDays: number): Date =>
  new Date(loanDate.getTime() + loanPeriodDays * MILLISECONDS_PER_DAY);
