import { describe, expect, it } from 'vitest';
import { addDays } from '../../utils/dates/add-days.ts';
import { parseCalendarDay } from '../../utils/dates/parse-calendar-day.ts';

describe('parseCalendarDay', () => {
  it('returns local midnight of the given day', () => {
    expect(parseCalendarDay('2026-10-07')).toEqual(new Date(2026, 9, 7));
  });
});

describe('addDays', () => {
  it('moves across a month end without changing the input', () => {
    const lastOfMonth = new Date(2026, 9, 31);

    expect(addDays(lastOfMonth, 1)).toEqual(new Date(2026, 10, 1));
    expect(lastOfMonth).toEqual(new Date(2026, 9, 31));
  });
});
