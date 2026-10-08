import { z } from 'zod';
import { addressSchema } from './address.schema.js';
import { createStringField, emailField, regexTypes } from './schema-field-helpers.js';

// Password rules for new passwords (registration, change password)
export const newPasswordField = createStringField({
  min: 8,
  max: 128,
  fieldName: 'סיסמה',
});

// Body of POST /auth/register
export const registerSchema = z.object({
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

  email: emailField,

  password: newPasswordField,

  phoneNumber: createStringField({
    min: 9,
    max: 10,
    fieldName: 'מספר טלפון',
    regex: regexTypes.digitsOnly,
    regexMessage: 'מספר טלפון יכול להכיל ספרות בלבד',
  }),

  address: addressSchema,
});

// Body of POST /auth/login - only presence is checked, so failures stay generic
export const loginSchema = z.object({
  email: emailField,

  password: z.string().min(1, { message: 'יש להזין סיסמה' }).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
