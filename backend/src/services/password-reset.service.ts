import { ActionType, EntityType, PasswordResetChannel, RecordStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BusinessErrorCode } from '@library/shared';
import {
  PASSWORD_RESET_AUDIT_SOURCE,
  PASSWORD_RESET_CODE_LIFETIME_MINUTES,
  PASSWORD_RESET_MAX_CODE_ATTEMPTS,
  PASSWORD_RESET_SESSION_LIFETIME_MINUTES,
} from '../constants/password-reset.ts';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { passwordResetRequestRepository } from '../repositories/password-reset-request.repository.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import { messageDeliveryService } from './message-delivery.service.ts';
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyPasswordResetCodeInput,
} from '../types/requests/password-reset.requests.types.ts';
import type {
  PasswordResetCodeSentRecord,
  PasswordResetCodeVerifiedRecord,
} from '../types/responses/password-reset.response.types.ts';
import { BusinessRuleError } from '../types/errors/BusinessRuleError.ts';
import { createPasswordResetCode } from '../utils/authentication/create-password-reset-code.ts';
import { createPasswordResetToken } from '../utils/authentication/create-password-reset-token.ts';
import { hashPasswordResetCode } from '../utils/authentication/hash-password-reset-code.ts';
import { hashPasswordResetToken } from '../utils/authentication/hash-password-reset-token.ts';
import { isPasswordResetCodeUsable } from '../utils/authentication/is-password-reset-code-usable.ts';
import { isPasswordResetSessionUsable } from '../utils/authentication/is-password-reset-session-usable.ts';
import { matchesPasswordResetCode } from '../utils/authentication/matches-password-reset-code.ts';
import { bcryptPassword } from '../utils/authentication/password-hash.ts';
import { addMinutes } from '../utils/dates/add-minutes.ts';
import { maskEmail } from '../utils/masking/mask-email.ts';
import { maskPhoneNumber } from '../utils/masking/mask-phone-number.ts';

const codeExpiredError = () =>
  new BusinessRuleError(
    BusinessErrorCode.PASSWORD_RESET_CODE_EXPIRED,
    'The code is no longer valid; ask for a new one',
  );

const sessionExpiredError = () =>
  new BusinessRuleError(
    BusinessErrorCode.PASSWORD_RESET_SESSION_EXPIRED,
    'The password reset time is over; start again',
  );

// The active account the code goes to, and where (its email, or its phone number)
const findAccountForReset = async (input: ForgotPasswordInput) => {
  if (input.channel === PasswordResetChannel.EMAIL) {
    const user = await userRepository.findByEmail(input.email);

    return user?.status === RecordStatus.ACTIVE
      ? { userId: user.id, destination: user.email, maskedDestination: maskEmail(user.email) }
      : null;
  }

  const users = await userRepository.findActiveByPhoneNumber(input.phoneNumber);

  // A shared (family) phone cannot tell which account to reset
  if (users.length > 1) {
    throw new BusinessRuleError(
      BusinessErrorCode.PASSWORD_RESET_PHONE_SHARED,
      'This phone number belongs to several accounts; use the email instead',
    );
  }

  return users.length === 1
    ? {
        userId: users[0].id,
        destination: users[0].phoneNumber,
        maskedDestination: maskPhoneNumber(users[0].phoneNumber),
      }
    : null;
};

export const passwordResetService = {
  // Sends a 6-digit code by email or SMS (simulated for now); replaces any open request
  async requestPasswordResetCode(input: ForgotPasswordInput): Promise<PasswordResetCodeSentRecord> {
    const account = await findAccountForReset(input);

    if (!account) {
      throw new BusinessRuleError(
        BusinessErrorCode.PASSWORD_RESET_ACCOUNT_NOT_FOUND,
        'No active account has this email or phone number',
        StatusCodes.NOT_FOUND,
      );
    }

    const code = createPasswordResetCode();
    const now = new Date();
    const codeExpiresDate = addMinutes(now, PASSWORD_RESET_CODE_LIFETIME_MINUTES);

    const request = await runInDatabaseTransaction(async (transactionClient) => {
      await passwordResetRequestRepository.closeOpenRequestsOfUser(
        account.userId,
        now,
        transactionClient,
      );

      const createdRequest = await passwordResetRequestRepository.create(
        account.userId,
        input.channel,
        codeExpiresDate,
        transactionClient,
      );

      await passwordResetRequestRepository.setCodeHash(
        createdRequest.id,
        hashPasswordResetCode(createdRequest.id, code),
        transactionClient,
      );

      return createdRequest;
    });

    return {
      requestId: request.id,
      channel: input.channel,
      maskedDestination: account.maskedDestination,
      codeExpiresDate,
      simulatedMessage: messageDeliveryService.sendPasswordResetCode(
        input.channel,
        account.destination,
        code,
      ),
    };
  },

  // The right code opens a 5-minute reset session; wrong codes are counted and limited
  async verifyPasswordResetCode({
    requestId,
    code,
  }: VerifyPasswordResetCodeInput): Promise<PasswordResetCodeVerifiedRecord> {
    const request = await passwordResetRequestRepository.findById(requestId);
    const now = new Date();

    if (!request || !isPasswordResetCodeUsable(request, now)) {
      throw codeExpiredError();
    }

    if (!matchesPasswordResetCode(request, code)) {
      const failedAttempts = await passwordResetRequestRepository.recordFailedAttempt(
        request.id,
        PASSWORD_RESET_MAX_CODE_ATTEMPTS,
        now,
      );

      if (failedAttempts >= PASSWORD_RESET_MAX_CODE_ATTEMPTS) {
        throw codeExpiredError();
      }

      throw new BusinessRuleError(
        BusinessErrorCode.PASSWORD_RESET_CODE_INCORRECT,
        'The code is incorrect',
        StatusCodes.BAD_REQUEST,
      );
    }

    const resetToken = createPasswordResetToken();
    const resetTokenExpiresDate = addMinutes(now, PASSWORD_RESET_SESSION_LIFETIME_MINUTES);

    // Guarded: the same code cannot open two sessions
    const isVerified = await passwordResetRequestRepository.markVerifiedIfOpen(
      request.id,
      hashPasswordResetToken(resetToken),
      resetTokenExpiresDate,
      now,
    );

    if (!isVerified) {
      throw codeExpiredError();
    }

    return { resetToken, resetTokenExpiresDate };
  },

  // Sets the new password inside the reset session; every open request of the user ends
  async resetPassword({ token, newPassword }: ResetPasswordInput): Promise<void> {
    const request = await passwordResetRequestRepository.findByResetTokenHash(
      hashPasswordResetToken(token),
    );

    if (!request || !isPasswordResetSessionUsable(request)) {
      throw sessionExpiredError();
    }

    const { user } = request;

    const newPasswordHash = await bcryptPassword.hashPassword(newPassword);

    await runInDatabaseTransaction(async (transactionClient) => {
      const now = new Date();

      // Guarded: two submits in the same session cannot both reset the password
      const isClosedByThisReset = await passwordResetRequestRepository.closeIfOpen(
        request.id,
        now,
        transactionClient,
      );

      if (!isClosedByThisReset) {
        throw sessionExpiredError();
      }

      await userRepository.updatePasswordHash(user.id, newPasswordHash, transactionClient);

      await passwordResetRequestRepository.closeOpenRequestsOfUser(user.id, now, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.USER_PASSWORD_CHANGED,
          actionUserId: user.id,
          actionUserRole: user.role,
          affectedType: EntityType.USER,
          affectedRecordId: user.id,
          additionalContext: { source: PASSWORD_RESET_AUDIT_SOURCE, channel: request.channel },
        },
        transactionClient,
      );
    });
  },
};
