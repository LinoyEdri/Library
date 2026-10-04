import type { Address, Prisma, RecordStatus, Role } from '@prisma/client';

// User row loaded together with its address
export type UserWithAddress = Prisma.UserGetPayload<{ include: { address: true } }>;

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
}

// Result of a successful login
export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  expiresAt: Date;
  user: SafeUser;
}

// Explicit field-by-field mapping so new sensitive columns are never leaked by accident
export function toSafeUser(user: UserWithAddress): SafeUser {
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
  };
}
