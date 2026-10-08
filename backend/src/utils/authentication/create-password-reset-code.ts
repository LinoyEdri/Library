import { randomInt } from 'node:crypto';

const CODE_DIGITS = 6;

// A random 6-digit code, e.g. "048213" (leading zeros kept)
export const createPasswordResetCode = (): string =>
  String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, '0');
