import { z } from 'zod';
import { PasswordResetChannel } from '../enums/password-reset-channel.enum.js';
import { newPasswordField } from './auth.schema.js';
import { emailField } from './schema-field-helpers.js';

// A phone number typed with or without dashes/spaces; only the 9-10 digits are kept
export const resetPhoneNumberField = z
  .string()
  .transform((phoneNumber) => phoneNumber.replace(/\D/g, ''))
  .pipe(z.string().regex(/^\d{9,10}$/, { message: 'יש להזין מספר טלפון בן 9-10 ספרות' }));

// Body of POST /auth/forgot-password: where to send the code (email or SMS)
export const forgotPasswordSchema = z.discriminatedUnion('channel', [
  z.object({
    channel: z.literal(PasswordResetChannel.EMAIL),
    email: emailField,
  }),
  z.object({
    channel: z.literal(PasswordResetChannel.SMS),
    phoneNumber: resetPhoneNumberField,
  }),
]);

// Body of POST /auth/forgot-password/verify: the request and the 6-digit code the user received
export const verifyPasswordResetCodeSchema = z.object({
  requestId: z.uuid({ message: 'בקשת האיפוס אינה תקינה' }),

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'יש להזין קוד בן 6 ספרות' }),
});

// Body of POST /auth/reset-password: the reset session token (after the code) and the new password
export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, { message: 'זמן האיפוס הסתיים, יש להתחיל מחדש' }).max(200),

  newPassword: newPasswordField,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyPasswordResetCodeInput = z.infer<typeof verifyPasswordResetCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
