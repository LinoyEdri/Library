import { z } from 'zod';
import { CopyStatus } from '../enums/copy-status.enum.js';
import { LoanStatus } from '../enums/loan-status.enum.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './list-query.schema.js';

const recordIdField = z.uuid({ message: 'מזהה רשומה לא תקין' });

// Body of POST /loans: the member, plus the book (a free copy is picked) or a specific copy's barcode
export const createLoanSchema = z
  .object({
    memberId: recordIdField,

    bookId: recordIdField.optional(),

    barcode: z.string().trim().max(50).optional(),
  })
  .refine((loan) => Boolean(loan.bookId || loan.barcode), {
    message: 'יש לבחור ספר או להזין ברקוד של עותק',
    path: ['bookId'],
  });

// Condition of the copy when it comes back: available again, damaged or lost
export const returnCopyConditions = [
  CopyStatus.AVAILABLE,
  CopyStatus.DAMAGED,
  CopyStatus.LOST,
] as const;

// Body of POST /loans/:id/return
export const processLoanReturnSchema = z.object({
  copyCondition: z.enum(returnCopyConditions).default(CopyStatus.AVAILABLE),
});

// Query string of GET /loans. Members always get only their own loans.
export const loanListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),

  // Words matched against the book title, the member's name and the copy barcode
  search: z.string().trim().max(200).optional(),

  status: z.enum(LoanStatus).optional(),

  memberId: recordIdField.optional(),

  bookId: recordIdField.optional(),

  // Open loans (active, overdue, return requested) whose due date has passed
  onlyOverdue: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),

  sortBy: z.enum(['createdDate', 'dueDate']).default('createdDate'),

  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ProcessLoanReturnInput = z.infer<typeof processLoanReturnSchema>;
export type ReturnCopyCondition = (typeof returnCopyConditions)[number];
export type LoanListQueryInput = z.infer<typeof loanListQuerySchema>;
