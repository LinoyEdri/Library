import { describe, expect, it } from 'vitest';
import { PasswordResetChannel, RecordStatus, Role } from '@prisma/client';
import type { PasswordResetRequestWithUser } from '../../types/database/password-reset-request-with-user.types.ts';
import { createPasswordResetCode } from '../../utils/authentication/create-password-reset-code.ts';
import { hashPasswordResetCode } from '../../utils/authentication/hash-password-reset-code.ts';
import { isPasswordResetCodeUsable } from '../../utils/authentication/is-password-reset-code-usable.ts';
import { isPasswordResetSessionUsable } from '../../utils/authentication/is-password-reset-session-usable.ts';
import { matchesPasswordResetCode } from '../../utils/authentication/matches-password-reset-code.ts';
import { maskEmail } from '../../utils/masking/mask-email.ts';
import { maskPhoneNumber } from '../../utils/masking/mask-phone-number.ts';

const now = new Date('2026-10-08T10:00:00Z');

const inFiveMinutes = new Date('2026-10-08T10:05:00Z');

const aMinuteAgo = new Date('2026-10-08T09:59:00Z');

const buildRequest = (
  changes: Partial<PasswordResetRequestWithUser> = {},
): PasswordResetRequestWithUser => ({
  id: 'request-id',
  userId: 'user-id',
  channel: PasswordResetChannel.SMS,
  codeHash: hashPasswordResetCode('request-id', '048213'),
  codeExpiresDate: inFiveMinutes,
  failedAttempts: 0,
  verifiedDate: null,
  resetTokenHash: null,
  resetTokenExpiresDate: null,
  closedDate: null,
  createdDate: now,
  user: { id: 'user-id', role: Role.MEMBER, status: RecordStatus.ACTIVE },
  ...changes,
});

describe('password reset codes', () => {
  it('creates 6-digit codes and matches only the right one', () => {
    expect(createPasswordResetCode()).toMatch(/^\d{6}$/);
    expect(matchesPasswordResetCode(buildRequest(), '048213')).toBe(true);
    expect(matchesPasswordResetCode(buildRequest(), '048214')).toBe(false);
  });

  it('hashes the same code differently in different requests', () => {
    expect(hashPasswordResetCode('first', '123456')).not.toBe(
      hashPasswordResetCode('second', '123456'),
    );
  });

  it('accepts a code only while open, unverified, in time, under the attempt limit', () => {
    expect(isPasswordResetCodeUsable(buildRequest(), now)).toBe(true);
    expect(isPasswordResetCodeUsable(buildRequest({ codeExpiresDate: aMinuteAgo }), now)).toBe(
      false,
    );
    expect(isPasswordResetCodeUsable(buildRequest({ failedAttempts: 5 }), now)).toBe(false);
    expect(isPasswordResetCodeUsable(buildRequest({ verifiedDate: now }), now)).toBe(false);
    expect(isPasswordResetCodeUsable(buildRequest({ closedDate: now }), now)).toBe(false);
  });

  it('allows the reset only after verification and within the session time', () => {
    const verifiedRequest = buildRequest({
      verifiedDate: now,
      resetTokenExpiresDate: inFiveMinutes,
    });

    expect(isPasswordResetSessionUsable(verifiedRequest, now)).toBe(true);
    expect(isPasswordResetSessionUsable(buildRequest(), now)).toBe(false);
    expect(
      isPasswordResetSessionUsable({ ...verifiedRequest, resetTokenExpiresDate: aMinuteAgo }, now),
    ).toBe(false);
  });
});

describe('masking where the code went', () => {
  it('hides most of the email and the phone number', () => {
    expect(maskEmail('dana.cohen@example.com')).toBe('d***@example.com');
    expect(maskPhoneNumber('0521234567')).toBe('052-***-4567');
  });
});
