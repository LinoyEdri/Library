import { z } from 'zod';
import { newPasswordField, registerSchema } from './auth.schema.js';

// Body of PATCH /users/me - the user edits their own details (email and role are not editable)
export const updateOwnProfileSchema = registerSchema.pick({
  firstName: true,
  lastName: true,
  phoneNumber: true,
  address: true,
});

// Body of POST /auth/change-password
export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'יש להזין את הסיסמה הנוכחית' }).max(128),

    newPassword: newPasswordField,
  })
  .refine((passwords) => passwords.newPassword !== passwords.currentPassword, {
    message: 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית',
    path: ['newPassword'],
  });

export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;
export type ChangeOwnPasswordInput = z.infer<typeof changeOwnPasswordSchema>;
