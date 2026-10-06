import type { User } from '@prisma/client';
import type { MemberWithUser } from '../../types/database/member-with-user.types.ts';
import type {
  MemberCandidateRecordResponse,
  MemberRecordResponse,
} from '../../types/responses/member.response.types.ts';

// Member + person details in one flat object (no password hash or internal user ids)
export const toMemberResponse = (member: MemberWithUser): MemberRecordResponse => ({
  id: member.id,
  userId: member.userId,
  status: member.status,
  registrationDate: member.registrationDate,
  updatedDate: member.updatedDate,
  disabledDate: member.disabledDate,
  firstName: member.user.firstName,
  lastName: member.user.lastName,
  email: member.user.email,
  phoneNumber: member.user.phoneNumber,
  address: member.user.address,
  accountStatus: member.user.status,
});

export const toMemberCandidateResponse = (user: User): MemberCandidateRecordResponse => ({
  userId: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
});
