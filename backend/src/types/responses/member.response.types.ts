import type { Address, RecordStatus } from '@prisma/client';

// A member with the person's details
export interface MemberRecordResponse {
  id: string;
  userId: string;
  status: RecordStatus;
  registrationDate: Date;
  updatedDate: Date;
  disabledDate: Date | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: Address;
  accountStatus: RecordStatus;
}

// A guest account that can become a member
export interface MemberCandidateRecordResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}
