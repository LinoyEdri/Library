import { randomBytes } from 'node:crypto';

const TOKEN_BYTE_LENGTH = 32;

// A random, URL-safe secret for the reset link (256 bits, so it cannot be guessed)
export const createPasswordResetToken = (): string =>
  randomBytes(TOKEN_BYTE_LENGTH).toString('base64url');
