import { RecordStatus, Role, type Prisma, type User } from '@prisma/client';
import type { RegisterInput } from '../types/requests/authentication.requests.types.ts';
import type { UpdateOwnProfileInput } from '../types/requests/profile.requests.types.ts';
import type {
  CreateUserInput,
  UpdateUserInput,
} from '../types/requests/user-management.requests.types.ts';
import type { UserPageFilters } from '../types/database/user-filters.types.ts';
import type { RecordStatusChange } from '../types/database/record-status-change.types.ts';
import { isUniqueConstraintViolation } from '../utils/prisma/is-unique-constraint-violation.ts';
import { splitSearchWords } from '../utils/search/split-search-words.ts';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import prisma from '../prisma/prisma.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import { PrismaErrorCodes } from '../prisma/error-codes.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { InternalError } from '../types/errors/InternalError.ts';
import {
  includeAddressAndMembership,
  type UserWithAddressAndMembership,
} from '../types/database/user-with-address-and-membership.types.ts';

// Users who never logged in go last when sorting by last login (only that column can be empty)
const buildUserOrderBy = (filters: UserPageFilters): Prisma.UserOrderByWithRelationInput =>
  filters.sortBy === 'lastLoginDate'
    ? { lastLoginDate: { sort: filters.sortOrder, nulls: 'last' } }
    : { [filters.sortBy]: filters.sortOrder };

export const userRepository = {
  async findByEmail(email: string): Promise<UserWithAddressAndMembership | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: includeAddressAndMembership,
      });
    } catch {
      throw new InternalError('Database connection error during lookup');
    }
  },

  async findById(id: string): Promise<UserWithAddressAndMembership | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: includeAddressAndMembership,
      });
    } catch {
      throw new InternalError('Database connection error during lookup');
    }
  },

  // Minimal data needed on every authenticated request (identity, role, status, member link)
  async findAuthenticationContextById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          member: { select: { id: true } },
        },
      });
    } catch {
      throw new InternalError('Database connection error during lookup');
    }
  },

  async updateLastLoginDate(
    id: string,
    lastLoginDate: Date,
    databaseClient: DatabaseClient = prisma,
  ): Promise<UserWithAddressAndMembership> {
    try {
      return await databaseClient.user.update({
        where: { id },
        data: { lastLoginDate },
        include: includeAddressAndMembership,
      });
    } catch {
      throw new InternalError('Failed to update last login date');
    }
  },

  // Updates the user's own details and their address in one atomic statement
  async updateProfileWithAddress(
    id: string,
    profile: UpdateOwnProfileInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<UserWithAddressAndMembership> {
    try {
      return await databaseClient.user.update({
        where: { id },
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
          address: {
            update: {
              street: profile.address.street,
              houseNumber: profile.address.houseNumber,
              apartmentOrUnit: profile.address.apartmentOrUnit ?? null,
              city: profile.address.city,
              postalCode: profile.address.postalCode ?? null,
              country: profile.address.country,
            },
          },
        },
        include: includeAddressAndMembership,
      });
    } catch {
      throw new InternalError('Failed to update profile');
    }
  },

  async updatePasswordHash(
    id: string,
    passwordHash: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<void> {
    try {
      await databaseClient.user.update({
        where: { id },
        data: { passwordHash },
      });
    } catch {
      throw new InternalError('Failed to update password');
    }
  },

  async updateRole(
    id: string,
    role: Role,
    databaseClient: DatabaseClient = prisma,
  ): Promise<UserWithAddressAndMembership> {
    try {
      return await databaseClient.user.update({
        where: { id },
        data: { role },
        include: includeAddressAndMembership,
      });
    } catch {
      throw new InternalError('Failed to change user role');
    }
  },

  // Active guest (VIEWER) accounts without a membership, matching the search text
  async findMemberCandidates(search: string | undefined, take: number): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        where: {
          role: Role.VIEWER,
          status: RecordStatus.ACTIVE,
          member: { is: null },
          ...(search && {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        take,
      });
    } catch {
      throw new InternalError('Failed to load member candidates');
    }
  },

  // One page of users plus the total count; every search word must match name or email
  async findPage(
    filters: UserPageFilters,
  ): Promise<{ users: UserWithAddressAndMembership[]; totalItems: number }> {
    const where: Prisma.UserWhereInput = {
      role: filters.role,
      status: filters.status,
      AND: splitSearchWords(filters.search).map((searchWord) => ({
        OR: [
          { firstName: { contains: searchWord, mode: 'insensitive' } },
          { lastName: { contains: searchWord, mode: 'insensitive' } },
          { email: { contains: searchWord, mode: 'insensitive' } },
        ],
      })),
    };

    try {
      const [users, totalItems] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          include: includeAddressAndMembership,
          orderBy: [buildUserOrderBy(filters), { id: 'asc' }],
          skip: filters.skip,
          take: filters.take,
        }),
        prisma.user.count({ where }),
      ]);

      return { users, totalItems };
    } catch {
      throw new InternalError('Failed to load users');
    }
  },

  // The oldest active admin; system jobs (e.g. marking overdue loans) are audited in their name
  async findFirstActiveAdmin(): Promise<User | null> {
    try {
      return await prisma.user.findFirst({
        where: { role: Role.ADMIN, status: RecordStatus.ACTIVE },
        orderBy: { createdDate: 'asc' },
      });
    } catch {
      throw new InternalError('Failed to find an administrator');
    }
  },

  async countActiveAdmins(): Promise<number> {
    try {
      return await prisma.user.count({
        where: { role: Role.ADMIN, status: RecordStatus.ACTIVE },
      });
    } catch {
      throw new InternalError('Failed to count administrators');
    }
  },

  // Name, email, phone and address of any account (admin user management)
  async updateAccountDetails(
    id: string,
    details: UpdateUserInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<UserWithAddressAndMembership> {
    try {
      return await databaseClient.user.update({
        where: { id },
        data: {
          firstName: details.firstName,
          lastName: details.lastName,
          email: details.email,
          phoneNumber: details.phoneNumber,
          address: {
            update: {
              street: details.address.street,
              houseNumber: details.address.houseNumber,
              apartmentOrUnit: details.address.apartmentOrUnit ?? null,
              city: details.address.city,
              postalCode: details.address.postalCode ?? null,
              country: details.address.country,
            },
          },
        },
        include: includeAddressAndMembership,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError('This email address is already registered');
      }

      throw new InternalError('Failed to update user');
    }
  },

  async updateStatus(
    id: string,
    statusChange: RecordStatusChange,
    databaseClient: DatabaseClient = prisma,
  ): Promise<UserWithAddressAndMembership> {
    try {
      return await databaseClient.user.update({
        where: { id },
        data: statusChange,
        include: includeAddressAndMembership,
      });
    } catch {
      throw new InternalError('Failed to change user status');
    }
  },

  // An admin creates an account with a chosen role (members are created through the member repository)
  async createUserByAdmin(
    user: CreateUserInput,
    passwordHash: string,
    createdByUserId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<UserWithAddressAndMembership> {
    try {
      return await databaseClient.user.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          passwordHash,
          phoneNumber: user.phoneNumber,
          role: user.role,
          createdBy: { connect: { id: createdByUserId } },
          address: {
            create: {
              street: user.address.street,
              houseNumber: user.address.houseNumber,
              apartmentOrUnit: user.address.apartmentOrUnit ?? null,
              city: user.address.city,
              postalCode: user.address.postalCode,
              country: user.address.country,
            },
          },
        },
        include: includeAddressAndMembership,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError('This email address is already registered');
      }

      throw new InternalError('Failed to create user');
    }
  },

  // Nested create: the address and user are written in one atomic statement
  async createUserWithAddress(
    userDto: RegisterInput,
    passwordHash: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<UserWithAddressAndMembership> {
    try {
      return await databaseClient.user.create({
        data: {
          firstName: userDto.firstName,
          lastName: userDto.lastName,
          email: userDto.email,
          passwordHash,
          phoneNumber: userDto.phoneNumber,
          address: {
            create: {
              street: userDto.address.street,
              houseNumber: userDto.address.houseNumber,
              apartmentOrUnit: userDto.address.apartmentOrUnit ?? null,
              city: userDto.address.city,
              postalCode: userDto.address.postalCode,
              country: userDto.address.country,
            },
          },
        },
        include: includeAddressAndMembership,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaErrorCodes.UNIQUE_CONSTRAINT
      ) {
        throw new ConflictError('This email address is already registered');
      }

      throw new InternalError('Account registration failed due to an internal storage issue');
    }
  },

  // Number of active accounts in each role (admin dashboard)
  async countActiveByRole(): Promise<{ role: Role; count: number }[]> {
    try {
      const groups = await prisma.user.groupBy({
        by: ['role'],
        where: { status: RecordStatus.ACTIVE },
        _count: { _all: true },
      });

      return groups.map((group) => ({ role: group.role, count: group._count._all }));
    } catch {
      throw new InternalError('Failed to count users');
    }
  },

  // Active accounts with this phone number (digits only); a family may share one
  async findActiveByPhoneNumber(phoneNumber: string): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        where: { phoneNumber, status: RecordStatus.ACTIVE },
        take: 2,
      });
    } catch {
      throw new InternalError('Database connection error during lookup');
    }
  },
};
