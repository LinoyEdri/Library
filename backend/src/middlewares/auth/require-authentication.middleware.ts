import { NextFunction, Request, Response } from 'express';
import { RecordStatus } from '@prisma/client';
import { userRepository } from '../../repositories/user.repository.ts';
import { UnauthorizedError } from '../../types/errors/UnauthorizedError.ts';
import { catchAsync } from '../../utils/http/catch-async.ts';
import { jwtToken } from '../../utils/authentication/access-token.ts';
import { extractBearerToken } from '../../utils/authentication/extract-bearer-token.ts';

// Verifies the JWT, then re-loads the user so disabled accounts and role changes apply immediately
export const requireAuthentication = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const tokenPayload = jwtToken.verifyAccessToken(token);

    const user = await userRepository.findAuthenticationContextById(tokenPayload.sub);

    if (!user || user.status === RecordStatus.DISABLED) {
      throw new UnauthorizedError('Account is not active');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      memberId: user.member?.id ?? null,
    };

    next();
  },
);
