import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { auditLogService } from '../services/audit-log.service.ts';
import type { AuditLogListQueryInput } from '../types/requests/audit-log.requests.types.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

export const auditLogController = {
  listAuditLogEntries: catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as AuditLogListQueryInput;

    const { items, meta } = await auditLogService.listAuditLogEntries(query);

    res
      .status(StatusCodes.OK)
      .json(
        ApiResponse.success(
          items,
          'Audit log entries retrieved',
          getStatusText(StatusCodes.OK),
          meta,
        ),
      );
  }),

  getAuditLogEntry: catchAsync(async (req: Request, res: Response) => {
    const entry = await auditLogService.getAuditLogEntry(String(req.params.id));

    res.status(StatusCodes.OK).json(ApiResponse.success(entry, 'Audit log entry retrieved'));
  }),
};
