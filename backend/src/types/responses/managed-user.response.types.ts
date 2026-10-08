import type { SafeUser } from './safe-user.response.types.ts';

// A user as admins see it in user management
export interface ManagedUserRecordResponse extends SafeUser {
  createdDate: Date;
  updatedDate: Date;
  disabledDate: Date | null;
  memberId: string | null;
}
