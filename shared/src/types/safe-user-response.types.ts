import type { RecordStatus } from '../enums/record-status.enum.js';
import type { Role } from '../enums/role.enum.js';

// Address as sent over the API
export interface AddressResponse {
  id: string;
  street: string;
  houseNumber: string;
  apartmentOrUnit: string;
  city: string;
  postalCode: string | null;
  country: string;
}

// User as sent over the API - never contains the password hash. Dates are ISO strings.
export interface SafeUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: RecordStatus;
  role: Role;
  address: AddressResponse;
  lastLoginDate: string | null;
  // Status of the library membership; null when the user is not a member
  membershipStatus: RecordStatus | null;
}

// Body returned by POST /auth/login
export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  expiresAt: string;
  user: SafeUserResponse;
}
