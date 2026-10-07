import { describe, expect, it } from 'vitest';
import { LoanStatus } from '@prisma/client';
import { calculateDueDate } from '../../utils/loans/calculate-due-date.ts';
import { isLoanPastDue } from '../../utils/loans/is-loan-past-due.ts';
import { resolveStatusAfterRequestCancel } from '../../utils/loans/resolve-status-after-request-cancel.ts';

const now = new Date('2026-10-07T10:00:00Z');

const yesterday = new Date('2026-10-06T10:00:00Z');

const tomorrow = new Date('2026-10-08T10:00:00Z');

describe('calculateDueDate', () => {
  it('adds the loan period in days', () => {
    expect(calculateDueDate(now, 14).toISOString()).toBe('2026-10-21T10:00:00.000Z');
  });
});

describe('isLoanPastDue', () => {
  it('is true for an open loan past its due date', () => {
    expect(isLoanPastDue({ status: LoanStatus.ACTIVE, dueDate: yesterday }, now)).toBe(true);
    expect(isLoanPastDue({ status: LoanStatus.RETURN_REQUESTED, dueDate: yesterday }, now)).toBe(
      true,
    );
  });

  it('is false before the due date or for a closed loan', () => {
    expect(isLoanPastDue({ status: LoanStatus.ACTIVE, dueDate: tomorrow }, now)).toBe(false);
    expect(isLoanPastDue({ status: LoanStatus.RETURNED, dueDate: yesterday }, now)).toBe(false);
    expect(isLoanPastDue({ status: LoanStatus.CANCELLED, dueDate: yesterday }, now)).toBe(false);
  });
});

describe('resolveStatusAfterRequestCancel', () => {
  it('goes back to ACTIVE before the due date and OVERDUE after it', () => {
    expect(resolveStatusAfterRequestCancel(tomorrow, now)).toBe(LoanStatus.ACTIVE);
    expect(resolveStatusAfterRequestCancel(yesterday, now)).toBe(LoanStatus.OVERDUE);
  });
});
