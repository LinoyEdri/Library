// How a password reset code reaches the user - must match Prisma `PasswordResetChannel`
export const PasswordResetChannel = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
} as const;

export type PasswordResetChannel = (typeof PasswordResetChannel)[keyof typeof PasswordResetChannel];
