import { z } from 'zod';
import { listQuerySchema } from './list-query.schema.js';
import { createStringField, regexTypes } from './schema-field-helpers.js';

// Optional long text (biography, description). Empty text is stored as null.
const optionalLongTextField = (fieldName: string) =>
  z
    .string()
    .trim()
    .max(2000, { message: `${fieldName} יכול להכיל עד 2000 תווים` })
    .nullable()
    .optional()
    .transform((value) => (value ? value : null));

// Route parameter of every "/:id" endpoint
export const recordIdParamsSchema = z.object({
  id: z.uuid({ message: 'מזהה רשומה לא תקין' }),
});

// Body of POST /authors and PATCH /authors/:id
export const authorDetailsSchema = z.object({
  firstName: createStringField({
    min: 1,
    max: 100,
    fieldName: 'שם פרטי',
    regex: regexTypes.lettersOnly,
    regexMessage: 'שם פרטי יכול להכיל אותיות בלבד',
  }),

  lastName: createStringField({
    min: 1,
    max: 100,
    fieldName: 'שם משפחה',
    regex: regexTypes.lettersOnly,
    regexMessage: 'שם משפחה יכול להכיל אותיות בלבד',
  }),

  biography: optionalLongTextField('ביוגרפיה'),
});

// Body of POST /publishers and PATCH /publishers/:id
export const publisherDetailsSchema = z.object({
  name: createStringField({
    min: 1,
    max: 200,
    fieldName: 'שם ההוצאה',
  }),

  description: optionalLongTextField('תיאור'),
});

// Body of POST /categories and PATCH /categories/:id
export const categoryDetailsSchema = z.object({
  name: createStringField({
    min: 1,
    max: 100,
    fieldName: 'שם הקטגוריה',
  }),
});

// Query string of GET /authors
export const authorListQuerySchema = listQuerySchema.extend({
  sortBy: z.enum(['lastName', 'firstName', 'createdDate']).default('lastName'),
});

// Query string of GET /publishers and GET /categories
export const namedRecordListQuerySchema = listQuerySchema.extend({
  sortBy: z.enum(['name', 'createdDate']).default('name'),
});

export type RecordIdParams = z.infer<typeof recordIdParamsSchema>;
export type AuthorDetailsInput = z.infer<typeof authorDetailsSchema>;
export type PublisherDetailsInput = z.infer<typeof publisherDetailsSchema>;
export type CategoryDetailsInput = z.infer<typeof categoryDetailsSchema>;
export type AuthorListQueryInput = z.infer<typeof authorListQuerySchema>;
export type NamedRecordListQueryInput = z.infer<typeof namedRecordListQuerySchema>;
