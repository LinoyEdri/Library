// One step in a loan's timeline (dates are ISO strings)
export interface LoanTimelineEvent {
  label: string;
  date: string;
  // A future step, e.g. the due date of a loan that is not late yet
  isUpcoming?: boolean;
  // The due date passed while the book is still out
  isMissed?: boolean;
}
