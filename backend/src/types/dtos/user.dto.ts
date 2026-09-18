import type { User } from '@prisma/client';

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  role: string;
  lastLoginDate: Date | null;
}

export interface LoginUser {
  accessToken: string,
  user: SafeUser,
};

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    status: user.status,
    role: user.role,
    lastLoginDate: user.lastLoginDate,
  };
}
