import { ACCESS_TOKEN_TYPE } from './access-token.ts';

// Reads "Authorization: Bearer <token>" and returns the token, or null when missing/malformed
export const extractBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [tokenType, token] = authorizationHeader.split(' ');

  if (tokenType !== ACCESS_TOKEN_TYPE || !token) {
    return null;
  }

  return token;
};
