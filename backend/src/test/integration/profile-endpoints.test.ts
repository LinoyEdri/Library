import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, Role } from '@prisma/client';
import { createApp } from '../../app.ts';
import {
  clearIntegrationTestDatabase,
  createTestUser,
  disconnectIntegrationTestDatabase,
  findAuditLogEntriesForRecord,
  TEST_USER_PASSWORD,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

const updatedProfileBody = {
  firstName: 'מיכל',
  lastName: 'לוי',
  phoneNumber: '0529876543',
  address: {
    street: 'ויצמן',
    houseNumber: '5',
    apartmentOrUnit: '2',
    city: 'חיפה',
  },
};

beforeEach(async () => {
  await clearIntegrationTestDatabase();
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('PATCH /api/users/me', () => {
  it.each([Role.ADMIN, Role.LIBRARIAN, Role.MEMBER, Role.VIEWER])(
    'lets a %s update their own name, phone and address',
    async (role) => {
      const user = await createTestUser({ role });

      const response = await request(application)
        .patch('/api/users/me')
        .set('Authorization', authorizationHeaderFor(user))
        .send(updatedProfileBody);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.firstName).toBe('מיכל');
      expect(response.body.data.address.city).toBe('חיפה');
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data).not.toHaveProperty('passwordHash');
    },
  );

  it('records USER_UPDATED and ADDRESS_UPDATED in the audit log', async () => {
    const user = await createTestUser();

    await request(application)
      .patch('/api/users/me')
      .set('Authorization', authorizationHeaderFor(user))
      .send(updatedProfileBody);

    const userAuditActions = (await findAuditLogEntriesForRecord(user.id)).map(
      (entry) => entry.actionType,
    );

    const addressAuditActions = (await findAuditLogEntriesForRecord(user.addressId)).map(
      (entry) => entry.actionType,
    );

    expect(userAuditActions).toEqual([ActionType.USER_UPDATED]);
    expect(addressAuditActions).toEqual([ActionType.ADDRESS_UPDATED]);
  });

  it('returns 400 for invalid input', async () => {
    const user = await createTestUser();

    const response = await request(application)
      .patch('/api/users/me')
      .set('Authorization', authorizationHeaderFor(user))
      .send({ ...updatedProfileBody, phoneNumber: 'abc' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('returns 401 without a token', async () => {
    const response = await request(application).patch('/api/users/me').send(updatedProfileBody);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});

describe('POST /api/auth/change-password', () => {
  it('changes the password so the new one works for login', async () => {
    const user = await createTestUser();

    const changeResponse = await request(application)
      .post('/api/auth/change-password')
      .set('Authorization', authorizationHeaderFor(user))
      .send({ currentPassword: TEST_USER_PASSWORD, newPassword: 'BrandNewPassword1' });

    const loginResponse = await request(application)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'BrandNewPassword1' });

    expect(changeResponse.status).toBe(StatusCodes.OK);
    expect(loginResponse.status).toBe(StatusCodes.OK);

    const auditActions = (await findAuditLogEntriesForRecord(user.id)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toContain(ActionType.USER_PASSWORD_CHANGED);
  });

  it('returns 400 (not 401) for a wrong current password', async () => {
    const user = await createTestUser();

    const response = await request(application)
      .post('/api/auth/change-password')
      .set('Authorization', authorizationHeaderFor(user))
      .send({ currentPassword: 'WrongPassword1', newPassword: 'BrandNewPassword1' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('returns 400 when the new password equals the current one', async () => {
    const user = await createTestUser();

    const response = await request(application)
      .post('/api/auth/change-password')
      .set('Authorization', authorizationHeaderFor(user))
      .send({ currentPassword: TEST_USER_PASSWORD, newPassword: TEST_USER_PASSWORD });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error.details[0].field).toBe('newPassword');
  });
});

describe('POST /api/auth/logout', () => {
  it('records USER_LOGOUT in the audit log', async () => {
    const user = await createTestUser({ role: Role.LIBRARIAN });

    const response = await request(application)
      .post('/api/auth/logout')
      .set('Authorization', authorizationHeaderFor(user));

    const auditActions = (await findAuditLogEntriesForRecord(user.id)).map(
      (entry) => entry.actionType,
    );

    expect(response.status).toBe(StatusCodes.OK);
    expect(auditActions).toEqual([ActionType.USER_LOGOUT]);
  });

  it('returns 401 without a token', async () => {
    const response = await request(application).post('/api/auth/logout');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});
