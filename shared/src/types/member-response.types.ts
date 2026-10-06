import type { RecordStatus } from '../enums/record-status.enum.js';
import type { AddressResponse } from './safe-user-response.types.js';

// A library member with the person's details. Dates are ISO strings.
export interface MemberResponse {
  id: string;
  userId: string;
  // Membership status (a disabled member cannot receive new loans)
  status: RecordStatus;
  registrationDate: string;
  updatedDate: string;
  disabledDate: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: AddressResponse;
  // Status of the person's login account
  accountStatus: RecordStatus;
}

// A guest account that staff can turn into a member
export interface MemberCandidateResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}
