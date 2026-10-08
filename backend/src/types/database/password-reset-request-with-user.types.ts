import type { Prisma } from '@prisma/client';

// A reset request with what is needed to use it: who it belongs to, their role and status
export const includePasswordResetRequestUser = {
  user: { select: { id: true, role: true, status: true } },
} satisfies Prisma.PasswordResetRequestInclude;

export type PasswordResetRequestWithUser = Prisma.PasswordResetRequestGetPayload<{
  include: typeof includePasswordResetRequestUser;
}>;
