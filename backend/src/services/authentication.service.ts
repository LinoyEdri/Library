import { ActionType, EntityType, RecordStatus } from '@prisma/client';
import type { LoginInput, RegisterInput } from '@library/shared';
import { jwtExpiresIn } from '../config/env.ts';
import { logger } from '../logger/logger.ts';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import { LoginResult, SafeUser, toSafeUser, type UserWithAddress } from '../types/dtos/user.dto.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { UnauthorizedError } from '../types/errors/UnauthorizedError.ts';
import { bcryptPassword } from '../utils/password-hash.ts';
import { ACCESS_TOKEN_TYPE, jwtToken } from '../utils/token.ts';

// One message for every login failure, so attackers cannot tell which emails exist
export const INVALID_LOGIN_MESSAGE = 'Invalid email or password';

// Compared against when the email is unknown, so the response takes the same time
const TIMING_EQUALIZER_PASSWORD_HASH =
  '$2b$10$tNaFQbDyn5sTbf1FhO4KF.4QdV6UPekvOq6V8dX26Y6.oDRBzMLxS';

// Why a login attempt for an existing account was rejected (stored in the audit log)
const LoginFailureReason = {
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
} as const;

// Audits a failed attempt on a known account. Never blocks the 401 response if the audit write fails.
const recordFailedLoginAttempt = async (user: UserWithAddress, reason: string): Promise<void> => {
  try {
    await auditLogService.recordAuditLogEntry({
      actionType: ActionType.USER_LOGIN_FAILED,
      actionUserId: user.id,
      actionUserRole: user.role,
      affectedType: EntityType.USER,
      affectedRecordId: user.id,
      additionalContext: { reason },
    });
  } catch (error) {
    logger.error({ err: error, userId: user.id }, 'Failed to audit a failed login attempt');
  }
};

export const authenticationService = {
  // Public sign-up: creates a VIEWER account with its address
  async register(input: RegisterInput): Promise<SafeUser> {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictError('This email address is already registered');
    }

    const passwordHash = await bcryptPassword.hashPassword(input.password);

    const newUser = await runInDatabaseTransaction(async (transactionClient) => {
      const createdUser = await userRepository.createUserWithAddress(
        input,
        passwordHash,
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.USER_CREATED,
          actionUserId: createdUser.id,
          actionUserRole: createdUser.role,
          affectedType: EntityType.USER,
          affectedRecordId: createdUser.id,
          newValue: toSafeUser(createdUser),
          additionalContext: { source: 'SELF_REGISTRATION' },
        },
        transactionClient,
      );

      return createdUser;
    });

    return toSafeUser(newUser);
  },

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await userRepository.findByEmail(input.email);

    const passwordMatches = await bcryptPassword.comparePassword(
      input.password,
      user?.passwordHash ?? TIMING_EQUALIZER_PASSWORD_HASH,
    );

    if (!user) {
      // Unknown email: cannot be audited (no user to link), so only logged
      logger.warn('Login failed for an unknown email address');

      throw new UnauthorizedError(INVALID_LOGIN_MESSAGE);
    }

    if (!passwordMatches || user.status === RecordStatus.DISABLED) {
      const reason = passwordMatches
        ? LoginFailureReason.ACCOUNT_DISABLED
        : LoginFailureReason.WRONG_PASSWORD;

      await recordFailedLoginAttempt(user, reason);

      throw new UnauthorizedError(INVALID_LOGIN_MESSAGE);
    }

    const accessToken = jwtToken.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const userAfterLogin = await runInDatabaseTransaction(async (transactionClient) => {
      const updatedUser = await userRepository.updateLastLoginDate(
        user.id,
        new Date(),
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.USER_LOGIN_SUCCEEDED,
          actionUserId: user.id,
          actionUserRole: user.role,
          affectedType: EntityType.USER,
          affectedRecordId: user.id,
        },
        transactionClient,
      );

      return updatedUser;
    });

    return {
      accessToken,
      tokenType: ACCESS_TOKEN_TYPE,
      expiresIn: jwtExpiresIn,
      expiresAt: jwtToken.getExpiryDate(accessToken),
      user: toSafeUser(userAfterLogin),
    };
  },

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return toSafeUser(user);
  },
};
