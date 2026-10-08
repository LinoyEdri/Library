import { ActionType, EntityType, RecordStatus, Role } from '@prisma/client';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { memberRepository } from '../repositories/member.repository.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { MemberWithUser } from '../types/database/member-with-user.types.ts';
import type {
  CreateMemberFromExistingUserInput,
  CreateMemberInput,
  CreateMemberWithNewPersonInput,
  MemberDetailsInput,
  MemberListQueryInput,
} from '../types/requests/member.requests.types.ts';
import type {
  MemberCandidateRecordResponse,
  MemberRecordResponse,
} from '../types/responses/member.response.types.ts';
import type { PaginatedResult } from '../types/responses/paginated-result.response.types.ts';
import { ValidationError } from '../types/errors/BadRequestError.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { ForbiddenError } from '../types/errors/ForbiddenError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { bcryptPassword } from '../utils/authentication/password-hash.ts';
import { haveSameValues } from '../utils/comparison/have-same-values.ts';
import {
  toMemberCandidateResponse,
  toMemberResponse,
} from '../utils/mappers/to-member-response.ts';
import { toPersonalDetails } from '../utils/mappers/to-personal-details.ts';
import { resolveRoleAfterMembershipChange } from '../utils/members/resolve-role-after-membership-change.ts';
import { buildPaginationMeta } from '../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../utils/pagination/to-page-request.ts';
import {
  buildDisableStatusChange,
  buildReactivateStatusChange,
} from '../utils/records/build-record-status-change.ts';

// How many accounts the "link existing user" picker shows at once
const MEMBER_CANDIDATES_LIMIT = 20;

const findMemberOrThrow = async (memberId: string): Promise<MemberWithUser> => {
  const member = await memberRepository.findById(memberId);

  if (!member) {
    throw new NotFoundError('Member not found');
  }

  return member;
};

// Writes the MEMBER_CREATED audit row inside the creating transaction
const recordMemberCreated = (
  actingUser: AuthenticatedUser,
  member: MemberWithUser,
  source: CreateMemberInput['mode'],
  transactionClient: DatabaseClient,
) =>
  auditLogService.recordAuditLogEntry(
    {
      actionType: ActionType.MEMBER_CREATED,
      actionUserId: actingUser.id,
      actionUserRole: actingUser.role,
      affectedType: EntityType.MEMBER,
      affectedRecordId: member.id,
      newValue: toMemberResponse(member),
      additionalContext: { source },
    },
    transactionClient,
  );

// Option A: an existing active guest account becomes a member (role VIEWER -> MEMBER)
const createMemberFromExistingUser = async (
  actingUser: AuthenticatedUser,
  { userId }: CreateMemberFromExistingUserInput,
): Promise<MemberWithUser> => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.member) {
    throw new ConflictError('This user is already a member');
  }

  if (user.role !== Role.VIEWER || user.status !== RecordStatus.ACTIVE) {
    throw new ValidationError('Only active guest accounts can become members');
  }

  return runInDatabaseTransaction(async (transactionClient) => {
    await userRepository.updateRole(userId, Role.MEMBER, transactionClient);

    const member = await memberRepository.createForExistingUser(
      userId,
      actingUser.id,
      transactionClient,
    );

    await auditLogService.recordAuditLogEntry(
      {
        actionType: ActionType.USER_ROLE_CHANGED,
        actionUserId: actingUser.id,
        actionUserRole: actingUser.role,
        affectedType: EntityType.USER,
        affectedRecordId: userId,
        previousValue: { role: user.role },
        newValue: { role: Role.MEMBER },
      },
      transactionClient,
    );

    await recordMemberCreated(actingUser, member, 'existingUser', transactionClient);

    return member;
  });
};

// Option B: a new person gets an account (MEMBER), an address and a membership together
const createMemberWithNewPerson = async (
  actingUser: AuthenticatedUser,
  person: CreateMemberWithNewPersonInput,
): Promise<MemberWithUser> => {
  if (await userRepository.findByEmail(person.email)) {
    throw new ConflictError('This email address is already registered');
  }

  const passwordHash = await bcryptPassword.hashPassword(person.password);

  return runInDatabaseTransaction(async (transactionClient) => {
    const member = await memberRepository.createWithNewUser(
      person,
      passwordHash,
      actingUser.id,
      transactionClient,
    );

    await auditLogService.recordAuditLogEntry(
      {
        actionType: ActionType.USER_CREATED,
        actionUserId: actingUser.id,
        actionUserRole: actingUser.role,
        affectedType: EntityType.USER,
        affectedRecordId: member.userId,
        newValue: {
          ...toPersonalDetails(member.user),
          email: member.user.email,
          role: Role.MEMBER,
        },
        additionalContext: { source: 'MEMBER_REGISTRATION' },
      },
      transactionClient,
    );

    await recordMemberCreated(actingUser, member, 'newPerson', transactionClient);

    return member;
  });
};

// Disable and reactivate share everything except the new status, the audit action and the role change
const changeMemberStatus = async (
  actingUser: AuthenticatedUser,
  memberId: string,
  targetStatus: RecordStatus,
): Promise<MemberRecordResponse> => {
  const member = await findMemberOrThrow(memberId);

  if (member.status === targetStatus) {
    throw new ConflictError(
      targetStatus === RecordStatus.DISABLED
        ? 'Member is already disabled'
        : 'Member is already active',
    );
  }

  const isDisabling = targetStatus === RecordStatus.DISABLED;

  const updatedMember = await runInDatabaseTransaction(async (transactionClient) => {
    const changedMember = await memberRepository.updateStatus(
      memberId,
      isDisabling ? buildDisableStatusChange(actingUser.id) : buildReactivateStatusChange(),
      transactionClient,
    );

    await auditLogService.recordAuditLogEntry(
      {
        actionType: isDisabling ? ActionType.MEMBER_DISABLED : ActionType.MEMBER_REACTIVATED,
        actionUserId: actingUser.id,
        actionUserRole: actingUser.role,
        affectedType: EntityType.MEMBER,
        affectedRecordId: memberId,
        previousValue: { status: member.status },
        newValue: { status: changedMember.status },
      },
      transactionClient,
    );

    // The account role follows the membership: disabled member -> guest, reactivated -> member
    const newRole = resolveRoleAfterMembershipChange(member.user.role, isDisabling);

    if (newRole) {
      await userRepository.updateRole(member.userId, newRole, transactionClient);

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.USER_ROLE_CHANGED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.USER,
          affectedRecordId: member.userId,
          previousValue: { role: member.user.role },
          newValue: { role: newRole },
          additionalContext: {
            reason: isDisabling ? 'MEMBERSHIP_DISABLED' : 'MEMBERSHIP_REACTIVATED',
          },
        },
        transactionClient,
      );
    }

    return changedMember;
  });

  return toMemberResponse(updatedMember);
};

export const memberService = {
  async listMembers(query: MemberListQueryInput): Promise<PaginatedResult<MemberRecordResponse>> {
    const { members, totalItems } = await memberRepository.findPage({
      ...toPageRequest(query.page, query.pageSize),
      search: query.search,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: members.map(toMemberResponse),
      meta: buildPaginationMeta(query.page, query.pageSize, totalItems),
    };
  },

  async listMemberCandidates(search?: string): Promise<MemberCandidateRecordResponse[]> {
    const candidates = await userRepository.findMemberCandidates(search, MEMBER_CANDIDATES_LIMIT);

    return candidates.map(toMemberCandidateResponse);
  },

  // Staff may open any member; a member may open only their own membership
  async getMember(
    actingUser: AuthenticatedUser,
    memberId: string,
    canViewAllMembers: boolean,
  ): Promise<MemberRecordResponse> {
    if (!canViewAllMembers && actingUser.memberId !== memberId) {
      throw new ForbiddenError('Members can only view their own membership');
    }

    return toMemberResponse(await findMemberOrThrow(memberId));
  },

  async getOwnMember(actingUser: AuthenticatedUser): Promise<MemberRecordResponse> {
    if (!actingUser.memberId) {
      throw new NotFoundError('The current user is not a member');
    }

    return toMemberResponse(await findMemberOrThrow(actingUser.memberId));
  },

  async createMember(
    actingUser: AuthenticatedUser,
    input: CreateMemberInput,
  ): Promise<MemberRecordResponse> {
    const member =
      input.mode === 'existingUser'
        ? await createMemberFromExistingUser(actingUser, input)
        : await createMemberWithNewPerson(actingUser, input);

    return toMemberResponse(member);
  },

  // Edits the person's name, phone and address; only the parts that changed are audited
  async updateMember(
    actingUser: AuthenticatedUser,
    memberId: string,
    details: MemberDetailsInput,
  ): Promise<MemberRecordResponse> {
    const memberBeforeUpdate = await findMemberOrThrow(memberId);

    await runInDatabaseTransaction(async (transactionClient) => {
      const userAfterUpdate = await userRepository.updateProfileWithAddress(
        memberBeforeUpdate.userId,
        details,
        transactionClient,
      );

      const previousPersonalDetails = toPersonalDetails(memberBeforeUpdate.user);
      const newPersonalDetails = toPersonalDetails(userAfterUpdate);

      if (!haveSameValues(previousPersonalDetails, newPersonalDetails)) {
        await auditLogService.recordAuditLogEntry(
          {
            actionType: ActionType.MEMBER_UPDATED,
            actionUserId: actingUser.id,
            actionUserRole: actingUser.role,
            affectedType: EntityType.MEMBER,
            affectedRecordId: memberId,
            previousValue: previousPersonalDetails,
            newValue: newPersonalDetails,
          },
          transactionClient,
        );
      }

      if (!haveSameValues(memberBeforeUpdate.user.address, userAfterUpdate.address)) {
        await auditLogService.recordAuditLogEntry(
          {
            actionType: ActionType.ADDRESS_UPDATED,
            actionUserId: actingUser.id,
            actionUserRole: actingUser.role,
            affectedType: EntityType.ADDRESS,
            affectedRecordId: userAfterUpdate.address.id,
            previousValue: memberBeforeUpdate.user.address,
            newValue: userAfterUpdate.address,
          },
          transactionClient,
        );
      }
    });

    return toMemberResponse(await findMemberOrThrow(memberId));
  },

  disableMember: (actingUser: AuthenticatedUser, memberId: string) =>
    changeMemberStatus(actingUser, memberId, RecordStatus.DISABLED),

  reactivateMember: (actingUser: AuthenticatedUser, memberId: string) =>
    changeMemberStatus(actingUser, memberId, RecordStatus.ACTIVE),
};
