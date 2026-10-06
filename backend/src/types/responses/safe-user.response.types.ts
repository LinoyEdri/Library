import type { Address, RecordStatus, Role } from '@prisma/client';

// User data that is safe to send to clients (no password hash)
export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: RecordStatus;
  role: Role;
  address: Address;
  lastLoginDate: Date | null;
  // Status of the library membership; null when the user is not a member
  membershipStatus: RecordStatus | null;
}
