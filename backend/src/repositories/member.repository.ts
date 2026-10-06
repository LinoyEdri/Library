import { Role, type Prisma } from '@prisma/client';
import prisma from '../prisma/prisma.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { MemberPageFilters } from '../types/database/member-filters.types.ts';
import {
  includeMemberUser,
  type MemberWithUser,
} from '../types/database/member-with-user.types.ts';
import type { RecordStatusChange } from '../types/database/record-status-change.types.ts';
import type { CreateMemberWithNewPersonInput } from '../types/requests/member.requests.types.ts';
import { ConflictError } from '../types/errors/ConflictError.ts';
import { InternalError } from '../types/errors/InternalError.ts';
import { isUniqueConstraintViolation } from '../utils/prisma/is-unique-constraint-violation.ts';
import { keepDigitsOnly } from '../utils/search/keep-digits-only.ts';
import { splitSearchWords } from '../utils/search/split-search-words.ts';

// One search word must match the first name, last name, email or phone (digits only)
const buildMemberSearchWordFilter = (searchWord: string): Prisma.MemberWhereInput => {
  const searchDigits = keepDigitsOnly(searchWord);

  return {
    user: {
      OR: [
        { firstName: { contains: searchWord, mode: 'insensitive' } },
        { lastName: { contains: searchWord, mode: 'insensitive' } },
        { email: { contains: searchWord, mode: 'insensitive' } },
        ...(searchDigits ? [{ phoneNumber: { contains: searchDigits } }] : []),
      ],
    },
  };
};

// Members are sorted by their registration date or by the person's name
const buildMemberOrderBy = (filters: MemberPageFilters): Prisma.MemberOrderByWithRelationInput =>
  filters.sortBy === 'registrationDate'
    ? { registrationDate: filters.sortOrder }
    : { user: { [filters.sortBy]: filters.sortOrder } };

export const memberRepository = {
  // One page of members plus the total count; every search word must match (full names work)
  async findPage(
    filters: MemberPageFilters,
  ): Promise<{ members: MemberWithUser[]; totalItems: number }> {
    const where: Prisma.MemberWhereInput = {
      status: filters.status,
      AND: splitSearchWords(filters.search).map(buildMemberSearchWordFilter),
    };

    try {
      const [members, totalItems] = await prisma.$transaction([
        prisma.member.findMany({
          where,
          include: includeMemberUser,
          orderBy: buildMemberOrderBy(filters),
          skip: filters.skip,
          take: filters.take,
        }),
        prisma.member.count({ where }),
      ]);

      return { members, totalItems };
    } catch {
      throw new InternalError('Failed to load members');
    }
  },

  async findById(id: string): Promise<MemberWithUser | null> {
    try {
      return await prisma.member.findUnique({ where: { id }, include: includeMemberUser });
    } catch {
      throw new InternalError('Failed to load member');
    }
  },

  // Membership for an account that already exists (its role is changed separately)
  async createForExistingUser(
    userId: string,
    registeredByUserId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<MemberWithUser> {
    try {
      return await databaseClient.member.create({
        data: { userId, registeredByUserId },
        include: includeMemberUser,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError('This user is already a member');
      }

      throw new InternalError('Failed to create member');
    }
  },

  // New person: account (MEMBER role) + address + membership in one atomic statement
  async createWithNewUser(
    person: CreateMemberWithNewPersonInput,
    passwordHash: string,
    registeredByUserId: string,
    databaseClient: DatabaseClient = prisma,
  ): Promise<MemberWithUser> {
    try {
      return await databaseClient.member.create({
        // Relations are linked with connect: Prisma does not allow raw id columns next to nested creates
        data: {
          registeredBy: { connect: { id: registeredByUserId } },
          user: {
            create: {
              firstName: person.firstName,
              lastName: person.lastName,
              email: person.email,
              phoneNumber: person.phoneNumber,
              passwordHash,
              role: Role.MEMBER,
              createdBy: { connect: { id: registeredByUserId } },
              address: {
                create: {
                  street: person.address.street,
                  houseNumber: person.address.houseNumber,
                  apartmentOrUnit: person.address.apartmentOrUnit,
                  city: person.address.city,
                  postalCode: person.address.postalCode,
                  country: person.address.country,
                },
              },
            },
          },
        },
        include: includeMemberUser,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError('This email address is already registered');
      }

      throw new InternalError('Failed to create member');
    }
  },

  async updateStatus(
    id: string,
    statusChange: RecordStatusChange,
    databaseClient: DatabaseClient = prisma,
  ): Promise<MemberWithUser> {
    try {
      return await databaseClient.member.update({
        where: { id },
        data: statusChange,
        include: includeMemberUser,
      });
    } catch {
      throw new InternalError('Failed to change member status');
    }
  },
};
