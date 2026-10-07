import { describe, expect, it } from 'vitest';
import { SystemSettingKey } from '@library/shared';
import { resolveSettingValue } from '../../utils/settings/resolve-setting-value.ts';

describe('resolveSettingValue', () => {
  it('uses a valid stored value', () => {
    expect(resolveSettingValue(SystemSettingKey.LOAN_PERIOD_DAYS, 30)).toBe(30);
  });

  it('falls back to the default when nothing is stored', () => {
    expect(resolveSettingValue(SystemSettingKey.LOAN_PERIOD_DAYS, undefined)).toBe(14);
    expect(resolveSettingValue(SystemSettingKey.MAX_ACTIVE_LOANS_PER_MEMBER, null)).toBe(5);
  });

  it('falls back to the default when the stored value breaks the rule', () => {
    expect(resolveSettingValue(SystemSettingKey.LOAN_PERIOD_DAYS, 500)).toBe(14);
    expect(resolveSettingValue(SystemSettingKey.LOAN_PERIOD_DAYS, 'abc')).toBe(14);
  });
});
