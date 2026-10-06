import type { Request } from 'express';
import type { AuthenticatedUser } from '../../types/authentication/authenticated-user.types.ts';
import { UnauthorizedError } from '../../types/errors/UnauthorizedError.ts';

// Returns req.user on routes behind requireAuthentication; throws 401 if it is missing
export const getAuthenticatedUser = (req: Request): AuthenticatedUser => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  return req.user;
};
