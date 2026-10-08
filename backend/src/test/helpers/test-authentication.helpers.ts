import type { Role } from '@prisma/client';
import { ACCESS_TOKEN_TYPE, jwtToken } from '../../utils/authentication/access-token.ts';

type TokenOwner = {
  id: string;
  email: string;
  role: Role;
};

// Signs a real access token for the user, skipping the login endpoint
export const createAccessTokenFor = (user: TokenOwner): string =>
  jwtToken.signAccessToken({ sub: user.id, email: user.email, role: user.role });

// Value for the Authorization header, e.g. "Bearer eyJ..."
export const authorizationHeaderFor = (user: TokenOwner): string =>
  `${ACCESS_TOKEN_TYPE} ${createAccessTokenFor(user)}`;
