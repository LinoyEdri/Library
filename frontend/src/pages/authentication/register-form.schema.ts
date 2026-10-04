import { z } from 'zod';
import { registerSchema } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Sign-up form = the shared register schema + a "confirm password" field (frontend only)
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((formValues) => formValues.password === formValues.confirmPassword, {
    message: HebrewTexts.authentication.passwordsDoNotMatch,
    path: ['confirmPassword'],
  });

export type RegisterFormInput = z.input<typeof registerFormSchema>;
export type RegisterFormOutput = z.output<typeof registerFormSchema>;
