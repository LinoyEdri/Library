import { z } from 'zod';
import { resetPasswordSchema } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Reset form: the new password (shared rules) typed twice; the session token is not a field
export const resetPasswordFormSchema = resetPasswordSchema
  .pick({ newPassword: true })
  .extend({ confirmNewPassword: z.string() })
  .refine((passwords) => passwords.newPassword === passwords.confirmNewPassword, {
    message: HebrewTexts.authentication.passwordsDoNotMatch,
    path: ['confirmNewPassword'],
  });

export type ResetPasswordFormInput = z.input<typeof resetPasswordFormSchema>;
export type ResetPasswordFormOutput = z.output<typeof resetPasswordFormSchema>;
