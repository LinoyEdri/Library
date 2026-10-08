import { createHash } from 'node:crypto';

// The stored form of a reset token. A fast hash is enough: the token is long and random,
// unlike a password, so it cannot be brute-forced.
export const hashPasswordResetToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
