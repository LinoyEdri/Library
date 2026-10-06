import { describe, expect, it } from 'vitest';
import { Role } from '@prisma/client';
import { resolveRoleAfterMembershipChange } from '../../utils/members/resolve-role-after-membership-change.ts';
import { keepDigitsOnly } from '../../utils/search/keep-digits-only.ts';
import { splitSearchWords } from '../../utils/search/split-search-words.ts';

describe('resolveRoleAfterMembershipChange', () => {
  it('turns a member into a guest when the membership is disabled', () => {
    expect(resolveRoleAfterMembershipChange(Role.MEMBER, true)).toBe(Role.VIEWER);
  });

  it('turns the guest back into a member when the membership is reactivated', () => {
    expect(resolveRoleAfterMembershipChange(Role.VIEWER, false)).toBe(Role.MEMBER);
  });

  it('leaves staff roles untouched', () => {
    expect(resolveRoleAfterMembershipChange(Role.LIBRARIAN, true)).toBeNull();
    expect(resolveRoleAfterMembershipChange(Role.ADMIN, false)).toBeNull();
  });
});

describe('search helpers', () => {
  it('splits the search text into words', () => {
    expect(splitSearchWords('  דנה   כהן ')).toEqual(['דנה', 'כהן']);
    expect(splitSearchWords(undefined)).toEqual([]);
  });

  it('keeps only the digits of a phone number', () => {
    expect(keepDigitsOnly('054-333 4455')).toBe('0543334455');
  });
});
