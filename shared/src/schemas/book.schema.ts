import { z } from 'zod';
import { CopyStatus } from '../enums/copy-status.enum.js';
import { optionalIsbnField } from './isbn-field.js';
import { listQuerySchema } from './list-query.schema.js';
import { createStringField } from './schema-field-helpers.js';

const EARLIEST_PUBLICATION_YEAR = 1000;

const recordIdField = z.uuid({ message: 'מזהה רשומה לא תקין' });

// Body of POST /books and PATCH /books/:id. The first author in authorIds is the primary author.
export const bookDetailsSchema = z.object({
  title: createStringField({ min: 1, max: 300, fieldName: 'שם הספר' }),

  isbn: optionalIsbnField,

  publisherId: recordIdField,

  authorIds: z
    .array(recordIdField)
    .min(1, { message: 'יש לבחור לפחות מחבר אחד' })
    .refine((authorIds) => new Set(authorIds).size === authorIds.length, {
      message: 'מחבר נבחר יותר מפעם אחת',
    }),

  categoryIds: z
    .array(recordIdField)
    .refine((categoryIds) => new Set(categoryIds).size === categoryIds.length, {
      message: 'קטגוריה נבחרה יותר מפעם אחת',
    })
    .default([]),

  // Empty input means "unknown year"; text from form fields is converted to a number
  publicationYear: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
    z
      .number({ message: 'שנת הוצאה חייבת להיות מספר' })
      .int({ message: 'שנת הוצאה חייבת להיות מספר שלם' })
      .min(EARLIEST_PUBLICATION_YEAR, { message: 'שנת הוצאה לא תקינה' })
      .max(new Date().getFullYear() + 1, { message: 'שנת הוצאה לא יכולה להיות בעתיד' })
      .nullable(),
  ),

  language: createStringField({ min: 1, max: 50, fieldName: 'שפה' }),

  imageUrl: z.union([z.url({ message: 'כתובת תמונה לא תקינה' }), z.literal('')]).default(''),

  description: z
    .string()
    .trim()
    .max(5000, { message: 'תיאור יכול להכיל עד 5000 תווים' })
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
});

// Query string of GET /books
export const bookListQuerySchema = listQuerySchema.extend({
  categoryId: recordIdField.optional(),
  authorId: recordIdField.optional(),
  publisherId: recordIdField.optional(),
  language: z.string().trim().max(50).optional(),
  availability: z.enum(['available', 'unavailable']).optional(),
  sortBy: z.enum(['title', 'publicationYear', 'createdDate']).default('title'),
});

// Body of POST /books/:id/copies
export const addBookCopySchema = z.object({
  barcode: createStringField({ min: 1, max: 50, fieldName: 'ברקוד' }),
});

// Statuses staff can set by hand. ON_LOAN is set only by the loans workflow.
export const settableCopyStatuses = [
  CopyStatus.AVAILABLE,
  CopyStatus.DAMAGED,
  CopyStatus.LOST,
  CopyStatus.DISABLED,
] as const;

// Body of PATCH /book-copies/:id/status
export const changeBookCopyStatusSchema = z.object({
  status: z.enum(settableCopyStatuses, { message: 'סטטוס עותק לא תקין' }),
});

export type BookDetailsInput = z.infer<typeof bookDetailsSchema>;
export type BookListQueryInput = z.infer<typeof bookListQuerySchema>;
export type AddBookCopyInput = z.infer<typeof addBookCopySchema>;
export type ChangeBookCopyStatusInput = z.infer<typeof changeBookCopyStatusSchema>;
