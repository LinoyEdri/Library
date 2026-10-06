import type { Prisma } from '@prisma/client';

// What the member repository loads with every member: the person's account and address
export const includeMemberUser = {
  user: {
    include: {
      address: true,
    },
  },
} as const satisfies Prisma.MemberInclude;

export type MemberWithUser = Prisma.MemberGetPayload<{ include: typeof includeMemberUser }>;
