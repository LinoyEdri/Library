import { LoanStatus, type LoanResponse } from '@library/shared';
import type { LoanTimelineEvent } from '../components/loans/loan-timeline-event.types';
import { HebrewTexts } from '../constants/hebrew-texts';

const { loans: texts } = HebrewTexts;

const OPEN_LOAN_STATUSES: LoanStatus[] = [
  LoanStatus.ACTIVE,
  LoanStatus.OVERDUE,
  LoanStatus.RETURN_REQUESTED,
];

// The loan's history in date order; an open loan also shows its upcoming (or missed) due date
export const buildLoanTimelineEvents = (loan: LoanResponse): LoanTimelineEvent[] => {
  const events: LoanTimelineEvent[] = [{ label: texts.timelineCreated, date: loan.createdDate }];

  if (loan.returnRequestedDate) {
    events.push({ label: texts.timelineReturnRequested, date: loan.returnRequestedDate });
  }

  if (loan.returnRequestCancelledDate) {
    events.push({
      label: texts.timelineReturnRequestCancelled,
      date: loan.returnRequestCancelledDate,
    });
  }

  if (loan.returnDate) {
    events.push({ label: texts.timelineReturned, date: loan.returnDate });
  }

  if (loan.status === LoanStatus.CANCELLED) {
    events.push({ label: texts.timelineCancelled, date: loan.updatedDate });
  }

  events.sort((first, second) => first.date.localeCompare(second.date));

  if (OPEN_LOAN_STATUSES.includes(loan.status)) {
    events.push({
      label: texts.timelineDueDate,
      date: loan.dueDate,
      isUpcoming: !loan.isPastDue,
      isMissed: loan.isPastDue,
    });
  }

  return events;
};
