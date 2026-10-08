import { ActionType, EntityType, RecordStatus, Role } from '@prisma/client';
import { BusinessErrorCode } from '@library/shared';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { memberRepository } from '../repositories/member.repository.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { UserWithAddressAndMembership } from '../types/database/user-with-address-and-membership.types.ts';
import type {
  CreateUserInput,
  UpdateUserInput,
  UserListQueryInput,
} from '../types/requests/user-management.requests.types.ts';
import type { ManagedUserRecordResponse } from '../types/responses/managed-user.response.types.ts';
import type { PaginatedResult } from '../types/responses/paginated-result.response.types.ts';
import { BusinessRuleError } from '../types/errors/BusinessRuleError.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { ForbiddenError } from '../types/errors/ForbiddenError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { bcryptPassword } from '../utils/authentication/password-hash.ts';
import { haveSameValues } from '../utils/comparison/have-same-values.ts';
import { toManagedUserResponse } from '../utils/mappers/to-managed-user-response.ts';
import { toPersonalDetails } from '../utils/mappers/to-personal-details.ts';
import { resolveMembershipChangeForRole } from '../utils/members/resolve-membership-change-for-role.ts';
import { buildPaginationMeta } from '../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../utils/pagination/to-page-request.ts';
import {
  buildDisableStatusChange,
  buildReactivateStatusChange,
} from '../utils/records/build-record-status-change.ts';

export const LAST_ACTIVE_ADMIN_MESSAGE = 'The last active administrator cannot be removed';

const findUserOrThrow = async (userId: string): Promise<UserWithAddressAndMembership> => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

// Admins may not disable or change the role of their own account
const assertNotOwnAccount = (actingUser: AuthenticatedUser, targetUserId: string) => {
  if (actingUser.id === targetUserId) {
    throw new ForbiddenError('You cannot change the role or status of your own account');
  }
};

// The system must always keep an active administrator (guards data from before the single-admin rule)
const assertNotLastActiveAdmin = async (user: UserWithAddressAndMembership) => {
  const isActiveAdmin = user.role === Role.ADMIN && user.status === RecordStatus.ACTIVE;

  if (isActiveAdmin && (await userRepository.countActiveAdmins()) <= 1) {
    throw new ConflictError(LAST_ACTIVE_ADMIN_MESSAGE);
  }
};

// There is only one admin: the new admin must be an active account
const assertCanBecomeAdmin = (user: UserWithAddressAndMembership) => {
  if (user.status !== RecordStatus.ACTIVE) {
    throw new BusinessRuleError(
      BusinessErrorCode.ADMIN_HANDOVER_TARGET_NOT_ACTIVE,
      'Only an active account can become the administrator',
    );
  }
};

// Making someone else admin hands the role over: the acting admin becomes a disabled viewer,
// so reactivating that account later gives back a viewer only (audited as role change + disable)
const handOverAdminRole = async (
  actingUser: AuthenticatedUser,
  newAdminUserId: string,
  transactionClient: DatabaseClient,
) => {
  await userRepository.updateRole(actingUser.id, Role.VIEWER, transactionClient);

  await userRepository.updateStatus(
    actingUser.id,
    buildDisableStatusChange(actingUser.id),
    transactionClient,
  );

  const auditBase = {
    actionUserId: actingUser.id,
    actionUserRole: actingUser.role,
    affectedType: EntityType.USER,
    affectedRecordId: actingUser.id,
    additionalContext: { reason: 'ADMIN_ROLE_HANDED_OVER', newAdminUserId },
  };

  await auditLogService.recordAuditLogEntry(
    {
      ...auditBase,
      actionType: ActionType.USER_ROLE_CHANGED,
      previousValue: { role: Role.ADMIN },
      newValue: { role: Role.VIEWER },
    },
    transactionClient,
  );

  await auditLogService.recordAuditLogEntry(
    {
      ...auditBase,
      actionType: ActionType.USER_DISABLED,
      previousValue: { status: RecordStatus.ACTIVE },
      newValue: { status: RecordStatus.DISABLED },
    },
    transactionClient,
  );
};

// Name, email and phone as stored in USER_UPDATED audit entries
const toAccountDetails = (user: UserWithAddressAndMembership) => ({
  ...toPersonalDetails(user),
  email: user.email,
});

// Creates, reactivates or disables the membership so it matches the new role (audited)
const syncMembershipWithRole = async (
  actingUser: AuthenticatedUser,
  user: UserWithAddressAndMembership,
  newRole: Role,
  transactionClient: DatabaseClient,
) => {
  const membershipChange = resolveMembershipChangeForRole(newRole, user.member);

  if (membershipChange === 'none') {
    return;
  }

  const auditBase = {
    actionUserId: actingUser.id,
    actionUserRole: actingUser.role,
    affectedType: EntityType.MEMBER,
    additionalContext: { reason: 'ROLE_CHANGED', newRole },
  };

  if (membershipChange === 'create') {
    const member = await memberRepository.createForExistingUser(
      user.id,
      actingUser.id,
      transactionClient,
    );

    await auditLogService.recordAuditLogEntry(
      { ...auditBase, actionType: ActionType.MEMBER_CREATED, affectedRecordId: member.id },
      transactionClient,
    );

    return;
  }

  const memberId = user.member?.id ?? '';

  const isReactivating = membershipChange === 'reactivate';

  await memberRepository.updateStatus(
    memberId,
    isReactivating ? buildReactivateStatusChange() : buildDisableStatusChange(actingUser.id),
    transactionClient,
  );

  await auditLogService.recordAuditLogEntry(
    {
      ...auditBase,
      actionType: isReactivating ? ActionType.MEMBER_REACTIVATED : ActionType.MEMBER_DISABLED,
      affectedRecordId: memberId,
    },
    transactionClient,
  );
};

// Disable and reactivate share everything except the new status and the audit action
const changeUserStatus = async (
  actingUser: AuthenticatedUser,
  userId: string,
  targetStatus: RecordStatus,
): Promise<ManagedUserRecordResponse> => {
  assertNotOwnAccount(actingUser, userId);

  const user = await findUserOrThrow(userId);

  const isDisabling = targetStatus === RecordStatus.DISABLED;

  if (user.status === targetStatus) {
    throw new ConflictError(isDisabling ? 'User is already disabled' : 'User is already active');
  }

  if (isDisabling) {
    await assertNotLastActiveAdmin(user);
  }

  const updatedUser = await runInDatabaseTransaction(async (transactionClient) => {
    const changedUser = await userRepository.updateStatus(
      userId,
      isDisabling ? buildDisableStatusChange(actingUser.id) : buildReactivateStatusChange(),
      transactionClient,
    );

    await auditLogService.recordAuditLogEntry(
      {
        actionType: isDisabling ? ActionType.USER_DISABLED : ActionType.USER_REACTIVATED,
        actionUserId: actingUser.id,
        actionUserRole: actingUser.role,
        affectedType: EntityType.USER,
        affectedRecordId: userId,
        previousValue: { status: user.status },
        newValue: { status: changedUser.status },
      },
      transactionClient,
    );

    return changedUser;
  });

  return toManagedUserResponse(updatedUser);
};

// Admin user management: every account, any role
export const userManagementService = {
  async listUsers(query: UserListQueryInput): Promise<PaginatedResult<ManagedUserRecordResponse>> {
    const { users, totalItems } = await userRepository.findPage({
      ...toPageRequest(query.page, query.pageSize),
      search: query.search,
      role: query.role,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: users.map(toManagedUserResponse),
      meta: buildPaginationMeta(query.page, query.pageSize, totalItems),
    };
  },

  async getUser(userId: string): Promise<ManagedUserRecordResponse> {
    return toManagedUserResponse(await findUserOrThrow(userId));
  },

  // MEMBER accounts also get their membership in the same transaction;
  // a new ADMIN takes over the admin role from the acting admin
  async createUser(
    actingUser: AuthenticatedUser,
    newUser: CreateUserInput,
  ): Promise<ManagedUserRecordResponse> {
    if (await userRepository.findByEmail(newUser.email)) {
      throw new ConflictError('This email address is already registered');
    }

    const passwordHash = await bcryptPassword.hashPassword(newUser.password);

    const createdUserId = await runInDatabaseTransaction(async (transactionClient) => {
      const auditBase = {
        actionUserId: actingUser.id,
        actionUserRole: actingUser.role,
      };

      if (newUser.role === Role.MEMBER) {
        const member = await memberRepository.createWithNewUser(
          { ...newUser, mode: 'newPerson' },
          passwordHash,
          actingUser.id,
          transactionClient,
        );

        await auditLogService.recordAuditLogEntry(
          {
            ...auditBase,
            actionType: ActionType.MEMBER_CREATED,
            affectedType: EntityType.MEMBER,
            affectedRecordId: member.id,
            additionalContext: { source: 'USER_MANAGEMENT' },
          },
          transactionClient,
        );

        return member.userId;
      }

      const user = await userRepository.createUserByAdmin(
        newUser,
        passwordHash,
        actingUser.id,
        transactionClient,
      );

      if (newUser.role === Role.ADMIN) {
        await handOverAdminRole(actingUser, user.id, transactionClient);
      }

      return user.id;
    });

    const createdUser = await findUserOrThrow(createdUserId);

    await auditLogService.recordAuditLogEntry({
      actionType: ActionType.USER_CREATED,
      actionUserId: actingUser.id,
      actionUserRole: actingUser.role,
      affectedType: EntityType.USER,
      affectedRecordId: createdUserId,
      newValue: { ...toAccountDetails(createdUser), role: createdUser.role },
      additionalContext: { source: 'USER_MANAGEMENT' },
    });

    return toManagedUserResponse(createdUser);
  },

  // Name, email, phone and address; only the parts that changed are audited
  async updateUser(
    actingUser: AuthenticatedUser,
    userId: string,
    details: UpdateUserInput,
  ): Promise<ManagedUserRecordResponse> {
    const userBeforeUpdate = await findUserOrThrow(userId);

    const updatedUser = await runInDatabaseTransaction(async (transactionClient) => {
      const userAfterUpdate = await userRepository.updateAccountDetails(
        userId,
        details,
        transactionClient,
      );

      const previousAccountDetails = toAccountDetails(userBeforeUpdate);
      const newAccountDetails = toAccountDetails(userAfterUpdate);

      if (!haveSameValues(previousAccountDetails, newAccountDetails)) {
        await auditLogService.recordAuditLogEntry(
          {
            actionType: ActionType.USER_UPDATED,
            actionUserId: actingUser.id,
            actionUserRole: actingUser.role,
            affectedType: EntityType.USER,
            affectedRecordId: userId,
            previousValue: previousAccountDetails,
            newValue: newAccountDetails,
          },
          transactionClient,
        );
      }

      if (!haveSameValues(userBeforeUpdate.address, userAfterUpdate.address)) {
        await auditLogService.recordAuditLogEntry(
          {
            actionType: ActionType.ADDRESS_UPDATED,
            actionUserId: actingUser.id,
            actionUserRole: actingUser.role,
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

    return toManagedUserResponse(updatedUser);
  },

  // Changes the role and keeps the membership in step (MEMBER <-> active membership).
  // Choosing ADMIN hands the admin role over from the acting admin.
  async changeUserRole(
    actingUser: AuthenticatedUser,
    userId: string,
    newRole: Role,
  ): Promise<ManagedUserRecordResponse> {
    assertNotOwnAccount(actingUser, userId);

    const user = await findUserOrThrow(userId);

    if (user.role === newRole) {
      throw new ConflictError('The user already has this role');
    }

    if (newRole === Role.ADMIN) {
      assertCanBecomeAdmin(user);
    } else {
      await assertNotLastActiveAdmin(user);
    }

    await runInDatabaseTransaction(async (transactionClient) => {
      await userRepository.updateRole(userId, newRole, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.USER_ROLE_CHANGED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.USER,
          affectedRecordId: userId,
          previousValue: { role: user.role },
          newValue: { role: newRole },
        },
        transactionClient,
      );

      await syncMembershipWithRole(actingUser, user, newRole, transactionClient);

      if (newRole === Role.ADMIN) {
        await handOverAdminRole(actingUser, userId, transactionClient);
      }
    });

    return toManagedUserResponse(await findUserOrThrow(userId));
  },

  disableUser: (actingUser: AuthenticatedUser, userId: string) =>
    changeUserStatus(actingUser, userId, RecordStatus.DISABLED),

  reactivateUser: (actingUser: AuthenticatedUser, userId: string) =>
    changeUserStatus(actingUser, userId, RecordStatus.ACTIVE),
};
