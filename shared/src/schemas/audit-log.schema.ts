import { z } from 'zod';
import { ActionType } from '../enums/action-type.enum.js';
import { EntityType } from '../enums/entity-type.enum.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './list-query.schema.js';

// A calendar day as the date input sends it, e.g. "2026-10-07"
const calendarDayField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'תאריך לא תקין' })
  .refine((day) => !Number.isNaN(Date.parse(day)), { message: 'תאריך לא תקין' });

// Query string of GET /audit-logs (admin). Both dates are whole days, inclusive.
export const auditLogListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),

    actionType: z.enum(ActionType).optional(),

    affectedType: z.enum(EntityType).optional(),

    actionUserId: z.uuid({ message: 'מזהה משתמש לא תקין' }).optional(),

    // The running entry number shown in the app (1, 2, 3...)
    entryNumber: z.coerce.number().int().min(1).optional(),

    // Any record id (books, loans, settings...), so it is not checked as a uuid
    affectedRecordId: z.string().trim().min(1).max(100).optional(),

    fromDate: calendarDayField.optional(),

    toDate: calendarDayField.optional(),

    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine((query) => !query.fromDate || !query.toDate || query.fromDate <= query.toDate, {
    message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
    path: ['toDate'],
  });

export type AuditLogListQueryInput = z.infer<typeof auditLogListQuerySchema>;
