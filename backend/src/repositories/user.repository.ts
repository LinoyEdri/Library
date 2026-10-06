import type { RegisterInput } from '../types/requests/authentication.requests.types.ts';
import type { UpdateOwnProfileInput } from '../types/requests/profile.requests.types.ts';
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
              apartmentOrUnit: profile.address.apartmentOrUnit,
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
              apartmentOrUnit: userDto.address.apartmentOrUnit,
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
};
