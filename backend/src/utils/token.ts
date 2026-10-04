import jwt, { type SignOptions } from 'jsonwebtoken';
import { jwtExpiresIn, jwtSecret } from '../config/env.ts';
import { UnauthorizedError } from '../types/errors/UnauthorizedError.ts';
import {
  AccessTokenPayload,
  accessTokenPayloadSchema,
} from '../schemas/access-token-payload.schema.ts';

export const ACCESS_TOKEN_TYPE = 'Bearer';

export const jwtToken = {
  signAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = {
      expiresIn: jwtExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, jwtSecret, options);
  },

  // Verifies signature and expiry, then checks the claims have the expected shape
  verifyAccessToken(token: string): AccessTokenPayload {
    let decoded: unknown;

    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token signature');
      }

      throw new UnauthorizedError('Authentication failed');
    }

    const result = accessTokenPayloadSchema.safeParse(decoded);

    if (!result.success) {
      throw new UnauthorizedError('Invalid token');
    }

    return result.data;
  },

  // Reads the `exp` claim of a token we just signed
  getExpiryDate(token: string): Date {
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded === 'string' || decoded.exp === undefined) {
      throw new UnauthorizedError('Token has no expiry');
    }

    return new Date(decoded.exp * 1000);
  },
};
