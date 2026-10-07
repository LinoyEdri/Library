import type { AuditLog, Prisma } from '@prisma/client';
import {
  includeAuditLogActor,
  type AuditLogWithActor,
} from '../types/database/audit-log-with-actor.types.ts';
import prisma from '../prisma/prisma.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import { InternalError } from '../types/errors/InternalError.ts';

// Append-only: this repository can create audit entries but never update or delete them
export const auditLogRepository = {
  async createAuditLogEntry(
    auditLogData: Prisma.AuditLogUncheckedCreateInput,
    databaseClient: DatabaseClient = prisma,
  ): Promise<AuditLog> {
    try {
      return await databaseClient.auditLog.create({ data: auditLogData });
    } catch {
      throw new InternalError('Failed to write audit log entry');
    }
  },

  // The newest entries with the acting user's name (admin dashboard)
  async findRecent(take: number): Promise<AuditLogWithActor[]> {
    try {
      return await prisma.auditLog.findMany({
        include: includeAuditLogActor,
        orderBy: [{ createdDate: 'desc' }, { id: 'desc' }],
        take,
      });
    } catch {
      throw new InternalError('Failed to load audit log entries');
    }
  },
};
