import type { Prisma } from '@prisma/client';

// An audit entry with the name of the user who acted
export const includeAuditLogActor = {
  actionUser: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.AuditLogInclude;

export type AuditLogWithActor = Prisma.AuditLogGetPayload<{
  include: typeof includeAuditLogActor;
}>;
