import { ActionType, EntityType } from '@prisma/client';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type { ChangeOwnPasswordInput } from '../types/requests/authentication.requests.types.ts';
import type { UpdateOwnProfileInput } from '../types/requests/profile.requests.types.ts';
import type { SafeUser } from '../types/responses/safe-user.response.types.ts';
import type { UserWithAddressAndMembership } from '../types/database/user-with-address-and-membership.types.ts';
import { haveSameValues } from '../utils/comparison/have-same-values.ts';
import { toPersonalDetails } from '../utils/mappers/to-personal-details.ts';
import { toSafeUser } from '../utils/mappers/to-safe-user.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { ValidationError } from '../types/errors/BadRequestError.ts';
import { bcryptPassword } from '../utils/authentication/password-hash.ts';

export const INCORRECT_CURRENT_PASSWORD_MESSAGE = 'הסיסמה הנוכחית שגויה';

// Loads the user or fails with 404
const findExistingUserOrThrow = async (userId: string): Promise<UserWithAddressAndMembership> => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

// Actions a logged-in user performs on their own account
export const profileService = {
  // Updates name, phone and address. Only the parts that really changed are audited.
  async updateOwnProfile(
    actingUser: AuthenticatedUser,
    profile: UpdateOwnProfileInput,
  ): Promise<SafeUser> {
    const userBeforeUpdate = await findExistingUserOrThrow(actingUser.id);

    const updatedUser = await runInDatabaseTransaction(async (transactionClient) => {
      const userAfterUpdate = await userRepository.updateProfileWithAddress(
        actingUser.id,
        profile,
        transactionClient,
      );

      const auditedChange = {
        actionUserId: actingUser.id,
        actionUserRole: actingUser.role,
      };

      const previousPersonalDetails = toPersonalDetails(userBeforeUpdate);
      const newPersonalDetails = toPersonalDetails(userAfterUpdate);

      if (!haveSameValues(previousPersonalDetails, newPersonalDetails)) {
        await auditLogService.recordAuditLogEntry(
          {
            ...auditedChange,
            actionType: ActionType.USER_UPDATED,
            affectedType: EntityType.USER,
            affectedRecordId: actingUser.id,
            previousValue: previousPersonalDetails,
            newValue: newPersonalDetails,
          },
          transactionClient,
        );
      }

      if (!haveSameValues(userBeforeUpdate.address, userAfterUpdate.address)) {
        await auditLogService.recordAuditLogEntry(
          {
            ...auditedChange,
            actionType: ActionType.ADDRESS_UPDATED,
            affectedType: EntityType.ADDRESS,
            affectedRecordId: userAfterUpdate.address.id,
            previousValue: userBeforeUpdate.address,
            newValue: userAfterUpdate.address,
          },
          transactionClient,
        );
      }

      return userAfterUpdate;
    });

    return toSafeUser(updatedUser);
  },

  // Requires the current password; a wrong one is a 400 (not 401, which would end the session)
  async changeOwnPassword(
    actingUser: AuthenticatedUser,
    passwords: ChangeOwnPasswordInput,
  ): Promise<void> {
    const user = await findExistingUserOrThrow(actingUser.id);

    const currentPasswordMatches = await bcryptPassword.comparePassword(
      passwords.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new ValidationError(INCORRECT_CURRENT_PASSWORD_MESSAGE);
    }

    const newPasswordHash = await bcryptPassword.hashPassword(passwords.newPassword);

    await runInDatabaseTransaction(async (transactionClient) => {
      await userRepository.updatePasswordHash(actingUser.id, newPasswordHash, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.USER_PASSWORD_CHANGED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.USER,
          affectedRecordId: actingUser.id,
        },
        transactionClient,
      );
    });
  },
};
