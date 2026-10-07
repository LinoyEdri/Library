import type { AuditLog, Prisma } from '@prisma/client';
import {
  includeAuditLogActor,
  type AuditLogWithActor,
} from '../types/database/audit-log-with-actor.types.ts';
import prisma from '../prisma/prisma.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { AuditLogPageFilters } from '../types/database/audit-log-filters.types.ts';
import { InternalError } from '../types/errors/InternalError.ts';

// Append-only: this repository can create and read audit entries, never update or delete them
// (a database trigger enforces the same rule)
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

  // One page of entries matching the filters, plus the total count
  async findPage(
    filters: AuditLogPageFilters,
  ): Promise<{ entries: AuditLogWithActor[]; totalItems: number }> {
    const where: Prisma.AuditLogWhereInput = {
      actionType: filters.actionType,
      affectedType: filters.affectedType,
      actionUserId: filters.actionUserId,
      entryNumber: filters.entryNumber,
      affectedRecordId: filters.affectedRecordId,
      createdDate: { gte: filters.createdFrom, lt: filters.createdBefore },
    };

    try {
      const [entries, totalItems] = await prisma.$transaction([
        prisma.auditLog.findMany({
          where,
          include: includeAuditLogActor,
          orderBy: [{ createdDate: filters.sortOrder }, { id: filters.sortOrder }],
          skip: filters.skip,
          take: filters.take,
        }),
        prisma.auditLog.count({ where }),
      ]);

      return { entries, totalItems };
    } catch {
      throw new InternalError('Failed to load audit log entries');
    }
  },

  async findById(id: string): Promise<AuditLogWithActor | null> {
    try {
      return await prisma.auditLog.findUnique({ where: { id }, include: includeAuditLogActor });
    } catch {
      throw new InternalError('Failed to load audit log entry');
    }
  },
};
