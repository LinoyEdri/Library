import type { AuditLog, Prisma } from '@prisma/client';
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
};
