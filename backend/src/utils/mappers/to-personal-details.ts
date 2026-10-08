import type { User } from '@prisma/client';

// The user's editable personal fields (used for USER_UPDATED audit snapshots)
export const toPersonalDetails = (user: User) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  phoneNumber: user.phoneNumber,
});
