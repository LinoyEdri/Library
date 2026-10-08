import { createHash } from 'node:crypto';

// Stored form of a code. The request id is mixed in, so the same code in two requests
// gives different hashes. Guessing is stopped by the attempt limit, not by the hash.
export const hashPasswordResetCode = (requestId: string, code: string): string =>
  createHash('sha256').update(`${requestId}:${code}`).digest('hex');
