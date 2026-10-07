import { describe, expect, it } from 'vitest';
import { RecordStatus, Role } from '@prisma/client';
import { resolveMembershipChangeForRole } from '../../utils/members/resolve-membership-change-for-role.ts';

describe('resolveMembershipChangeForRole', () => {
  it('creates a membership for a new MEMBER without one', () => {
    expect(resolveMembershipChangeForRole(Role.MEMBER, null)).toBe('create');
  });

  it('reactivates a disabled membership when the role becomes MEMBER again', () => {
    expect(resolveMembershipChangeForRole(Role.MEMBER, { status: RecordStatus.DISABLED })).toBe(
      'reactivate',
    );
  });

  it('disables an active membership when the role is no longer MEMBER', () => {
    expect(resolveMembershipChangeForRole(Role.LIBRARIAN, { status: RecordStatus.ACTIVE })).toBe(
      'disable',
    );
  });

  it('does nothing when the membership already matches', () => {
    expect(resolveMembershipChangeForRole(Role.MEMBER, { status: RecordStatus.ACTIVE })).toBe(
      'none',
    );
    expect(resolveMembershipChangeForRole(Role.VIEWER, null)).toBe('none');
  });
});
