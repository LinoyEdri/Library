import { z } from 'zod';
import { changeOwnPasswordSchema } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

// Change-password form = the shared schema + a "confirm new password" field (frontend only).
// safeExtend keeps the shared "new password must differ" rule.
export const changePasswordFormSchema = changeOwnPasswordSchema
  .safeExtend({ confirmNewPassword: z.string() })
  .refine((passwords) => passwords.newPassword === passwords.confirmNewPassword, {
    message: HebrewTexts.authentication.passwordsDoNotMatch,
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormInput = z.input<typeof changePasswordFormSchema>;
export type ChangePasswordFormOutput = z.output<typeof changePasswordFormSchema>;
