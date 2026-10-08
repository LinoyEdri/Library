import type { AuthenticatedUser } from './authentication/authenticated-user.types.ts';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AuthenticatedUser;
    }
  }
}

export {};
