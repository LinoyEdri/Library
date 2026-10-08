import type { SafeUser } from './safe-user.response.types.ts';

// Returned by POST /auth/login
export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  expiresAt: Date;
  user: SafeUser;
}
