import { Router } from 'express';
import { auditLogListQuerySchema, Permission, recordIdParamsSchema } from '@library/shared';
import { auditLogController } from '../controllers/audit-log.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const auditLogsRouter = Router();

// Read-only and admin only: there are no routes that change or delete audit entries
auditLogsRouter.use(requireAuthentication, authorizePermission(Permission.AUDIT_LOGS_VIEW));

auditLogsRouter.get(
  '/',
  validate(RequestLocation.QUERY, auditLogListQuerySchema),
  auditLogController.listAuditLogEntries,
);

auditLogsRouter.get(
  '/:id',
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  auditLogController.getAuditLogEntry,
);

export default auditLogsRouter;
