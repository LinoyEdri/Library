import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, RecordStatus, Role } from '@prisma/client';
import { createApp } from '../../app.ts';
import {
  clearIntegrationTestDatabase,
  createTestUser,
  disconnectIntegrationTestDatabase,
  findAuditLogEntriesForRecord,
  findUserById,
  TEST_USER_PASSWORD,
  updateTestUser,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

const validRegistrationBody = {
  firstName: 'דנה',
  lastName: 'כהן',
  email: 'Dana.Cohen@Example.com',
  password: 'StrongPassword1',
  phoneNumber: '0501234567',
  address: {
    street: 'הרצל',
    houseNumber: '12',
    apartmentOrUnit: '4',
    city: 'תל אביב',
  },
};

beforeEach(async () => {
  await clearIntegrationTestDatabase();
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('POST /api/auth/register', () => {
  it('creates a VIEWER with a Hebrew name and returns the safe user in the envelope', async () => {
    const response = await request(application)
      .post('/api/auth/register')
      .send(validRegistrationBody);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('dana.cohen@example.com');
    expect(response.body.data.role).toBe(Role.VIEWER);
    expect(response.body.data.address.city).toBe('תל אביב');
    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('writes a USER_CREATED audit entry', async () => {
    const response = await request(application)
      .post('/api/auth/register')
      .send(validRegistrationBody);

    const auditEntries = await findAuditLogEntriesForRecord(response.body.data.id);

    expect(auditEntries.map((entry) => entry.actionType)).toEqual([ActionType.USER_CREATED]);
    expect(JSON.stringify(auditEntries[0].newValue)).not.toContain('passwordHash');
  });

  it('returns 409 when the email is already registered', async () => {
    await request(application).post('/api/auth/register').send(validRegistrationBody);

    const response = await request(application)
      .post('/api/auth/register')
      .send(validRegistrationBody);

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 with field details for invalid input', async () => {
    const response = await request(application)
      .post('/api/auth/register')
      .send({ ...validRegistrationBody, email: 'not-an-email', firstName: 'Dana1' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error.details.map((detail: { field: string }) => detail.field)).toEqual(
      expect.arrayContaining(['email', 'firstName']),
    );
  });
});

describe('POST /api/auth/login', () => {
  it('returns a bearer token, expiry and the user, and updates lastLoginDate', async () => {
    const user = await createTestUser({ role: Role.LIBRARIAN });

    const response = await request(application)
      .post('/api/auth/login')
      .send({ email: user.email, password: TEST_USER_PASSWORD });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.tokenType).toBe('Bearer');
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.expiresAt).toEqual(expect.any(String));
    expect(response.body.data.user).not.toHaveProperty('passwordHash');

    const userAfterLogin = await findUserById(user.id);

    expect(userAfterLogin?.lastLoginDate).toBeInstanceOf(Date);
  });

  it('records USER_LOGIN_SUCCEEDED in the audit log', async () => {
    const user = await createTestUser();

    await request(application)
      .post('/api/auth/login')
      .send({ email: user.email, password: TEST_USER_PASSWORD });

    const auditEntries = await findAuditLogEntriesForRecord(user.id);

    expect(auditEntries.map((entry) => entry.actionType)).toContain(
      ActionType.USER_LOGIN_SUCCEEDED,
    );
  });

  it('returns the same generic 401 for a wrong password and an unknown email', async () => {
    const user = await createTestUser();

    const wrongPasswordResponse = await request(application)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPassword1' });

    const unknownEmailResponse = await request(application)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: TEST_USER_PASSWORD });

    expect(wrongPasswordResponse.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(unknownEmailResponse.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(wrongPasswordResponse.body.message).toBe(unknownEmailResponse.body.message);
  });

  it('records USER_LOGIN_FAILED for a wrong password on a known account', async () => {
    const user = await createTestUser();

    await request(application)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPassword1' });

    const auditEntries = await findAuditLogEntriesForRecord(user.id);

    expect(auditEntries.map((entry) => entry.actionType)).toEqual([ActionType.USER_LOGIN_FAILED]);
  });

  it('rejects a disabled account with the generic 401', async () => {
    const user = await createTestUser({ status: RecordStatus.DISABLED });

    const response = await request(application)
      .post('/api/auth/login')
      .send({ email: user.email, password: TEST_USER_PASSWORD });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user for a valid token', async () => {
    const user = await createTestUser({ role: Role.MEMBER });

    const response = await request(application)
      .get('/api/auth/me')
      .set('Authorization', authorizationHeaderFor(user));

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.id).toBe(user.id);
    expect(response.body.data.role).toBe(Role.MEMBER);
    expect(response.body.data.membershipStatus).toBe(RecordStatus.ACTIVE);
  });

  it('returns 401 without a token', async () => {
    const response = await request(application).get('/api/auth/me');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns 401 for a malformed or tampered token', async () => {
    const user = await createTestUser();

    const tamperedHeader = `${authorizationHeaderFor(user)}tampered`;

    const tamperedResponse = await request(application)
      .get('/api/auth/me')
      .set('Authorization', tamperedHeader);

    const malformedResponse = await request(application)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer');

    expect(tamperedResponse.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(malformedResponse.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('returns 401 once the account is disabled, even with a still-valid token', async () => {
    const user = await createTestUser();

    const authorizationHeader = authorizationHeaderFor(user);

    await updateTestUser(user.id, { status: RecordStatus.DISABLED });

    const response = await request(application)
      .get('/api/auth/me')
      .set('Authorization', authorizationHeader);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});
