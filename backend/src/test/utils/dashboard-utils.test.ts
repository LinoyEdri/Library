import { describe, expect, it } from 'vitest';
import { buildCountByKey } from '../../utils/dashboard/build-count-by-key.ts';
import { getStartOfDay } from '../../utils/dates/get-start-of-day.ts';

describe('buildCountByKey', () => {
  it('fills every key, using 0 for keys without a group', () => {
    expect(
      buildCountByKey(
        ['ADMIN', 'MEMBER', 'VIEWER'],
        [
          { key: 'MEMBER', count: 4 },
          { key: 'ADMIN', count: 1 },
        ],
      ),
    ).toEqual({ ADMIN: 1, MEMBER: 4, VIEWER: 0 });
  });
});

describe('getStartOfDay', () => {
  it('returns local midnight of the same day without changing the input', () => {
    const afternoon = new Date(2026, 9, 7, 15, 30, 45);

    const startOfDay = getStartOfDay(afternoon);

    expect(startOfDay).toEqual(new Date(2026, 9, 7, 0, 0, 0, 0));
    expect(afternoon.getHours()).toBe(15);
  });
});
