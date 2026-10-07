import { RecordStatus, Role } from '@prisma/client';
import type { MembershipChange } from '../../types/members/membership-change.types.ts';

// Keeps role and membership in step: only MEMBER accounts have an active membership.
// - becoming MEMBER: create the membership, or reactivate a disabled one
// - any other role: disable an active membership (history is kept)
export const resolveMembershipChangeForRole = (
  newRole: Role,
  membership: { status: RecordStatus } | null,
): MembershipChange => {
  if (newRole === Role.MEMBER) {
    if (!membership) {
      return 'create';
    }

    return membership.status === RecordStatus.DISABLED ? 'reactivate' : 'none';
  }

  return membership?.status === RecordStatus.ACTIVE ? 'disable' : 'none';
};
