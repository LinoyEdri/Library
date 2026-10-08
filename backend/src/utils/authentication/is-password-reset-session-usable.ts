import { RecordStatus } from '@prisma/client';
import type { PasswordResetRequestWithUser } from '../../types/database/password-reset-request-with-user.types.ts';

// The new password can be set: code verified, request still open, in time, account active
export const isPasswordResetSessionUsable = (
  request: PasswordResetRequestWithUser,
  now: Date = new Date(),
): boolean =>
  request.closedDate === null &&
  request.verifiedDate !== null &&
  request.resetTokenExpiresDate !== null &&
  request.resetTokenExpiresDate > now &&
  request.user.status === RecordStatus.ACTIVE;
