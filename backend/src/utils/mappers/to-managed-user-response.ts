import type { UserWithAddressAndMembership } from '../../types/database/user-with-address-and-membership.types.ts';
import type { ManagedUserRecordResponse } from '../../types/responses/managed-user.response.types.ts';
import { toSafeUser } from './to-safe-user.ts';

// Safe user plus the dates and membership link admins need (still no password hash)
export const toManagedUserResponse = (
  user: UserWithAddressAndMembership,
): ManagedUserRecordResponse => ({
  ...toSafeUser(user),
  createdDate: user.createdDate,
  updatedDate: user.updatedDate,
  disabledDate: user.disabledDate,
  memberId: user.member?.id ?? null,
});
