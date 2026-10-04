import type { AuthenticatedUser } from './authenticated-user.ts';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AuthenticatedUser;
    }
  }
}

export {};
