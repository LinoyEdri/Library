import type { Prisma } from '@prisma/client';

// What the user repository loads: the user, their address and (for members) the membership status
export const includeAddressAndMembership = {
  address: true,
  member: {
    select: {
      status: true,
    },
  },
} as const satisfies Prisma.UserInclude;

export type UserWithAddressAndMembership = Prisma.UserGetPayload<{
  include: typeof includeAddressAndMembership;
}>;
