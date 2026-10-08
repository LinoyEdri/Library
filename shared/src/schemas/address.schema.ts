import { z } from 'zod';
import { createStringField, regexTypes } from './schema-field-helpers.js';

// Postal address used by registration, profile and member forms
export const addressSchema = z.object({
  street: createStringField({
    min: 1,
    max: 255,
    fieldName: 'רחוב',
    regex: regexTypes.lettersOnly,
    regexMessage: 'שם הרחוב יכול להכיל אותיות בלבד',
  }),

  houseNumber: createStringField({
    min: 1,
    max: 50,
    fieldName: 'מספר בית',
  }),

  // Optional: a private house has no apartment number
  apartmentOrUnit: createStringField({
    min: 1,
    max: 50,
    fieldName: 'דירה',
  })
    .nullable()
    .optional(),

  city: createStringField({
    min: 1,
    max: 100,
    fieldName: 'עיר',
    regex: regexTypes.lettersOnly,
    regexMessage: 'שם העיר יכול להכיל אותיות בלבד',
  }),

  postalCode: createStringField({
    min: 1,
    max: 7,
    fieldName: 'מיקוד',
    regex: regexTypes.digitsOnly,
    regexMessage: 'מיקוד יכול להכיל ספרות בלבד',
  })
    .nullable()
    .optional(),

  country: createStringField({
    min: 1,
    max: 100,
    fieldName: 'מדינה',
    regex: regexTypes.lettersOnly,
    regexMessage: 'שם המדינה יכול להכיל אותיות בלבד',
  }).default('Israel'),
});

export type AddressInput = z.infer<typeof addressSchema>;
