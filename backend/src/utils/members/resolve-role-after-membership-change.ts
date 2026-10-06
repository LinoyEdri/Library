import { Role } from '@prisma/client';

// Disabling a membership turns the member into a guest (VIEWER); reactivating turns them back.
// Returns null when the role should stay as it is (e.g. the account was meanwhile given a staff role).
export const resolveRoleAfterMembershipChange = (
  currentRole: Role,
  isDisablingMembership: boolean,
): Role | null => {
  if (isDisablingMembership && currentRole === Role.MEMBER) {
    return Role.VIEWER;
  }

  if (!isDisablingMembership && currentRole === Role.VIEWER) {
    return Role.MEMBER;
  }

  return null;
};
