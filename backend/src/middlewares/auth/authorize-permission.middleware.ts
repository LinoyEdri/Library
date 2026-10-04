import { NextFunction, Request, Response } from 'express';
import { hasAnyPermission, type Permission } from '@library/shared';
import { ForbiddenError } from '../../types/errors/ForbiddenError.ts';
import { UnauthorizedError } from '../../types/errors/UnauthorizedError.ts';

// Allows the request when the user's role has at least one of the given permissions.
// Must run after requireAuthentication.
export const authorizePermission = (...allowedPermissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!hasAnyPermission(req.user.role, allowedPermissions)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
};
