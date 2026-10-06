import type { UserWithAddressAndMembership } from '../../types/database/user-with-address-and-membership.types.ts';
import type { SafeUser } from '../../types/responses/safe-user.response.types.ts';

// Explicit field-by-field mapping so new sensitive columns are never leaked by accident
export function toSafeUser(user: UserWithAddressAndMembership): SafeUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    status: user.status,
    role: user.role,
    address: user.address,
    lastLoginDate: user.lastLoginDate,
    membershipStatus: user.member?.status ?? null,
  };
}
