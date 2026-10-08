import type { AuditLog } from '@prisma/client';
import { auditLogRepository } from '../repositories/audit-log.repository.ts';
import { auditReferencedRecordRepository } from '../repositories/audit-referenced-record.repository.ts';
import type { AuditLogWithActor } from '../types/database/audit-log-with-actor.types.ts';
import type { AuditLogEntryInput } from '../types/audit/audit-log-entry-input.types.ts';
import type { DatabaseClient } from '../types/database/database-client.types.ts';
import type { AuditLogListQueryInput } from '../types/requests/audit-log.requests.types.ts';
import type { AuditLogEntryRecord } from '../types/responses/audit-log.response.types.ts';
import type { PaginatedResult } from '../types/responses/paginated-result.response.types.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { buildAuditReferenceNames } from '../utils/audit/build-audit-reference-names.ts';
import { collectAuditReferenceIds } from '../utils/audit/collect-audit-reference-ids.ts';
import { toAuditJsonValue } from '../utils/audit/to-audit-json-value.ts';
import { addDays } from '../utils/dates/add-days.ts';
import { parseCalendarDay } from '../utils/dates/parse-calendar-day.ts';
import { toAuditLogEntryResponse } from '../utils/mappers/to-audit-log-entry-response.ts';
import { buildPaginationMeta } from '../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../utils/pagination/to-page-request.ts';

// Maps entries to the API shape, naming every record they point at (one lookup per page)
const toNamedAuditLogEntries = async (
  entries: AuditLogWithActor[],
): Promise<AuditLogEntryRecord[]> => {
  const referencedRecords = await auditReferencedRecordRepository.findByIds(
    collectAuditReferenceIds(entries),
  );

  const namesByRecordId = buildAuditReferenceNames(referencedRecords);

  return entries.map((entry) => toAuditLogEntryResponse(entry, namesByRecordId));
};

export const auditLogService = {
  // Pass the transaction client so the audit entry commits together with the change itself
  async recordAuditLogEntry(
    entry: AuditLogEntryInput,
    databaseClient?: DatabaseClient,
  ): Promise<AuditLog> {
    return auditLogRepository.createAuditLogEntry(
      {
        actionType: entry.actionType,
        actionUserId: entry.actionUserId,
        actionUserRole: entry.actionUserRole,
        affectedType: entry.affectedType,
        affectedRecordId: entry.affectedRecordId ?? null,
        previousValue: toAuditJsonValue(entry.previousValue),
        newValue: toAuditJsonValue(entry.newValue),
        additionalContext: toAuditJsonValue(entry.additionalContext),
      },
      databaseClient,
    );
  },

  // Admin audit log list; "toDate" includes that whole day
  async listAuditLogEntries(
    query: AuditLogListQueryInput,
  ): Promise<PaginatedResult<AuditLogEntryRecord>> {
    const { entries, totalItems } = await auditLogRepository.findPage({
      ...toPageRequest(query.page, query.pageSize),
      actionType: query.actionType,
      affectedType: query.affectedType,
      actionUserId: query.actionUserId,
      entryNumber: query.entryNumber,
      affectedRecordId: query.affectedRecordId,
      createdFrom: query.fromDate ? parseCalendarDay(query.fromDate) : undefined,
      createdBefore: query.toDate ? addDays(parseCalendarDay(query.toDate), 1) : undefined,
      sortOrder: query.sortOrder,
    });

    return {
      items: await toNamedAuditLogEntries(entries),
      meta: buildPaginationMeta(query.page, query.pageSize, totalItems),
    };
  },

  async getAuditLogEntry(entryId: string): Promise<AuditLogEntryRecord> {
    const entry = await auditLogRepository.findById(entryId);

    if (!entry) {
      throw new NotFoundError('Audit log entry not found');
    }

    const [namedEntry] = await toNamedAuditLogEntries([entry]);

    return namedEntry;
  },
};
