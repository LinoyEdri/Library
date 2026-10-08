import { timingSafeEqual } from 'node:crypto';
import { hashPasswordResetCode } from './hash-password-reset-code.ts';

// Compares in constant time, so response timing does not hint at how close a guess was
export const matchesPasswordResetCode = (
  request: { id: string; codeHash: string },
  typedCode: string,
): boolean => {
  const typedCodeHash = Buffer.from(hashPasswordResetCode(request.id, typedCode), 'hex');
  const storedCodeHash = Buffer.from(request.codeHash, 'hex');

  return (
    typedCodeHash.length === storedCodeHash.length && timingSafeEqual(typedCodeHash, storedCodeHash)
  );
};
