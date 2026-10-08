import { RecordStatus } from '@prisma/client';
import { PASSWORD_RESET_MAX_CODE_ATTEMPTS } from '../../constants/password-reset.ts';
import type { PasswordResetRequestWithUser } from '../../types/database/password-reset-request-with-user.types.ts';

// The code can still be typed: request open, not yet verified, in time, attempts left, account active
export const isPasswordResetCodeUsable = (
  request: PasswordResetRequestWithUser,
  now: Date = new Date(),
): boolean =>
  request.closedDate === null &&
  request.verifiedDate === null &&
  request.codeExpiresDate > now &&
  request.failedAttempts < PASSWORD_RESET_MAX_CODE_ATTEMPTS &&
  request.user.status === RecordStatus.ACTIVE;
