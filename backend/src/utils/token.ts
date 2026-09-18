import jwt, { type SignOptions } from 'jsonwebtoken';
import { jwtExpiresIn, jwtSecret } from '../config/env.ts'; 
import { UnauthorizedError } from '../types/errors/UnauthorizedError.ts';
import { ValidationError } from '../types/errors/BadRequestError.ts';
import { AccessTokenPayload, accessTokenPayloadSchema } from '../schemas/user.schema.ts';

export const jwtToken = {
  signAccessToken(payload: AccessTokenPayload): string {
    const options: SignOptions = {
      expiresIn: jwtExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, jwtSecret, options);
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    let decoded: unknown;
      
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      if(error instanceof jwt.TokenExpiredError) {
          throw new UnauthorizedError("Token has expired");
      } 
      if (error instanceof jwt.JsonWebTokenError) {
          throw new UnauthorizedError("Invalid token signature");
      } 

      throw new UnauthorizedError("Authentication failed");
    }
      
    const result = accessTokenPayloadSchema.safeParse(decoded);

    if (!result.success) {
      throw new ValidationError("Token structure is invalid or properties are missing");
    }

    return result.data;
  }
}


