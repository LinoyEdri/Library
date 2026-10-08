import type { SafeUserResponse } from './safe-user-response.types.js';

// A user as admins see it in user management. Dates are ISO strings.
export interface ManagedUserResponse extends SafeUserResponse {
  createdDate: string;
  updatedDate: string;
  disabledDate: string | null;
  // The membership linked to this account, if any (active or disabled)
  memberId: string | null;
}
