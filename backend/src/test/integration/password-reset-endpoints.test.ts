import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, RecordStatus, Role } from '@prisma/client';
import { BusinessErrorCode, PasswordResetChannel } from '@library/shared';
import { createApp } from '../../app.ts';
import {
  clearIntegrationTestDatabase,
  createTestUser,
  disconnectIntegrationTestDatabase,
  expireTestPasswordResetRequest,
  findAuditLogEntriesForRecord,
  findPasswordResetRequestsOfUser,
  TEST_USER_PASSWORD,
  updateTestUser,
} from '../helpers/test-database.helpers.ts';

const application = createApp();

const MEMBER_EMAIL = 'reset.member@example.com';

// createTestUser gives every account this phone number
const TEST_PHONE_NUMBER = '0501234567';

const NEW_PASSWORD = 'BrandNewPassword9';

let memberId: string;

const askForCodeByEmail = (email = MEMBER_EMAIL) =>
  request(application)
    .post('/api/auth/forgot-password')
    .send({ channel: PasswordResetChannel.EMAIL, email });

const askForCodeBySms = (phoneNumber: string) =>
  request(application)
    .post('/api/auth/forgot-password')
    .send({ channel: PasswordResetChannel.SMS, phoneNumber });

const verifyCode = (requestId: string, code: string) =>
  request(application).post('/api/auth/forgot-password/verify').send({ requestId, code });

const resetPassword = (token: string, newPassword = NEW_PASSWORD) =>
  request(application).post('/api/auth/reset-password').send({ token, newPassword });

const logIn = (password: string) =>
  request(application).post('/api/auth/login').send({ email: MEMBER_EMAIL, password });

// A code that is surely different from the real one
const wrongCodeFor = (code: string) => (code === '111111' ? '222222' : '111111');

// Asks for a code by email and types it in; returns the reset session token
const openResetSession = async () => {
  const { requestId, simulatedMessage } = (await askForCodeByEmail()).body.data;

  return (await verifyCode(requestId, simulatedMessage.code)).body.data.resetToken as string;
};

beforeEach(async () => {
  await clearIntegrationTestDatabase();

  const member = await createTestUser({ role: Role.MEMBER, email: MEMBER_EMAIL });

  memberId = member.id;
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('POST /api/auth/forgot-password', () => {
  it('"sends" a 6-digit code by email and shows where it went', async () => {
    const response = await askForCodeByEmail();

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data).toMatchObject({
      channel: PasswordResetChannel.EMAIL,
      maskedDestination: 'r***@example.com',
      simulatedMessage: {
        channel: PasswordResetChannel.EMAIL,
        recipient: MEMBER_EMAIL,
        validMinutes: 5,
      },
    });
    expect(response.body.data.simulatedMessage.code).toMatch(/^\d{6}$/);
  });

  it('finds the account by phone number, with or without dashes', async () => {
    const response = await askForCodeBySms('050-123-4567');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.maskedDestination).toBe('050-***-4567');
    expect(response.body.data.simulatedMessage.recipient).toBe(TEST_PHONE_NUMBER);
  });

  it('closes the older open request when a new code is asked for', async () => {
    await askForCodeByEmail();
    await askForCodeByEmail();

    const requests = await findPasswordResetRequestsOfUser(memberId);

    expect(requests.map((resetRequest) => resetRequest.closedDate === null)).toEqual([false, true]);
  });

  it('rejects an unknown email, an unknown phone and a disabled account', async () => {
    const unknownEmailResponse = await askForCodeByEmail('nobody@example.com');
    const unknownPhoneResponse = await askForCodeBySms('0599999999');

    await updateTestUser(memberId, { status: RecordStatus.DISABLED });

    const disabledResponse = await askForCodeByEmail();

    for (const response of [unknownEmailResponse, unknownPhoneResponse, disabledResponse]) {
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.error.code).toBe(BusinessErrorCode.PASSWORD_RESET_ACCOUNT_NOT_FOUND);
    }
  });

  it('asks for the email when the phone belongs to several accounts', async () => {
    await createTestUser({ role: Role.VIEWER });

    const response = await askForCodeBySms(TEST_PHONE_NUMBER);

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.error.code).toBe(BusinessErrorCode.PASSWORD_RESET_PHONE_SHARED);
  });

  it('validates the email or phone number', async () => {
    expect((await askForCodeByEmail('not-an-email')).status).toBe(StatusCodes.BAD_REQUEST);
    expect((await askForCodeBySms('12')).status).toBe(StatusCodes.BAD_REQUEST);
  });
});

describe('POST /api/auth/forgot-password/verify', () => {
  it('opens a 5-minute reset session for the right code', async () => {
    const { requestId, simulatedMessage } = (await askForCodeByEmail()).body.data;

    const response = await verifyCode(requestId, simulatedMessage.code);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.resetToken).toEqual(expect.any(String));

    const minutesLeft =
      (new Date(response.body.data.resetTokenExpiresDate).getTime() - Date.now()) / 60_000;

    expect(minutesLeft).toBeGreaterThan(4);
    expect(minutesLeft).toBeLessThanOrEqual(5);
  });

  it('counts wrong codes and locks the request after 5', async () => {
    const { requestId, simulatedMessage } = (await askForCodeByEmail()).body.data;
    const wrongCode = wrongCodeFor(simulatedMessage.code);

    const firstResponse = await verifyCode(requestId, wrongCode);

    expect(firstResponse.status).toBe(StatusCodes.BAD_REQUEST);
    expect(firstResponse.body.error.code).toBe(BusinessErrorCode.PASSWORD_RESET_CODE_INCORRECT);

    for (let attempt = 2; attempt <= 5; attempt += 1) {
      await verifyCode(requestId, wrongCode);
    }

    const afterLockResponse = await verifyCode(requestId, simulatedMessage.code);

    expect(afterLockResponse.status).toBe(StatusCodes.CONFLICT);
    expect(afterLockResponse.body.error.code).toBe(BusinessErrorCode.PASSWORD_RESET_CODE_EXPIRED);
  });

  it('rejects an expired code, a replaced code and a code used twice', async () => {
    const first = (await askForCodeByEmail()).body.data;
    const second = (await askForCodeByEmail()).body.data;

    expect((await verifyCode(first.requestId, first.simulatedMessage.code)).status).toBe(
      StatusCodes.CONFLICT,
    );

    expect((await verifyCode(second.requestId, second.simulatedMessage.code)).status).toBe(
      StatusCodes.OK,
    );

    expect((await verifyCode(second.requestId, second.simulatedMessage.code)).status).toBe(
      StatusCodes.CONFLICT,
    );

    const third = (await askForCodeByEmail()).body.data;

    await expireTestPasswordResetRequest(third.requestId);

    expect((await verifyCode(third.requestId, third.simulatedMessage.code)).status).toBe(
      StatusCodes.CONFLICT,
    );
  });
});

describe('POST /api/auth/reset-password', () => {
  it('sets the new password, closes the request and audits the change with the channel', async () => {
    const resetToken = await openResetSession();

    const response = await resetPassword(resetToken);

    expect(response.status).toBe(StatusCodes.OK);
    expect((await logIn(NEW_PASSWORD)).status).toBe(StatusCodes.OK);
    expect((await logIn(TEST_USER_PASSWORD)).status).toBe(StatusCodes.UNAUTHORIZED);

    const [resetRequest] = await findPasswordResetRequestsOfUser(memberId);

    expect(resetRequest.closedDate).not.toBeNull();

    const auditEntries = await findAuditLogEntriesForRecord(memberId);

    expect(
      auditEntries.find((entry) => entry.actionType === ActionType.USER_PASSWORD_CHANGED),
    ).toMatchObject({
      actionUserId: memberId,
      additionalContext: { source: 'PASSWORD_RESET', channel: PasswordResetChannel.EMAIL },
    });
  });

  it('works only once and only within the 5 minutes', async () => {
    const resetToken = await openResetSession();

    await resetPassword(resetToken);

    const secondResponse = await resetPassword(resetToken, 'AnotherPassword9');

    expect(secondResponse.status).toBe(StatusCodes.CONFLICT);
    expect(secondResponse.body.error.code).toBe(BusinessErrorCode.PASSWORD_RESET_SESSION_EXPIRED);

    const lateToken = await openResetSession();
    const [, lateRequest] = await findPasswordResetRequestsOfUser(memberId);

    await expireTestPasswordResetRequest(lateRequest.id);

    expect((await resetPassword(lateToken)).status).toBe(StatusCodes.CONFLICT);
    expect((await resetPassword('no-such-token')).status).toBe(StatusCodes.CONFLICT);
  });

  it('applies the password rules', async () => {
    const resetToken = await openResetSession();

    expect((await resetPassword(resetToken, 'short')).status).toBe(StatusCodes.BAD_REQUEST);
    expect((await logIn(TEST_USER_PASSWORD)).status).toBe(StatusCodes.OK);
  });
});
