// Why a login attempt for an existing account was rejected (stored in the audit log)
export const LoginFailureReason = {
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
} as const;

export type LoginFailureReason = (typeof LoginFailureReason)[keyof typeof LoginFailureReason];
