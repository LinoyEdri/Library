import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, RecordStatus, Role } from '@prisma/client';
import { BusinessErrorCode } from '@library/shared';
import { createApp } from '../../app.ts';
import {
  clearIntegrationTestDatabase,
  createTestUser,
  disconnectIntegrationTestDatabase,
  findAuditLogEntriesForRecord,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

type TestContext = {
  adminId: string;
  adminHeader: string;
  librarianHeader: string;
};

let context: TestContext;

const newUserBody = {
  firstName: 'רון',
  lastName: 'שמש',
  email: 'ron.shemesh@example.com',
  password: 'StaffPassword1',
  phoneNumber: '0541112233',
  address: {
    street: 'בן יהודה',
    houseNumber: '7',
    apartmentOrUnit: '2',
    city: 'ירושלים',
  },
};

// Creates a user through the admin API and returns the response body data
const createUserAsAdmin = async (role: Role, overrides: object = {}) => {
  const response = await request(application)
    .post('/api/users')
    .set('Authorization', context.adminHeader)
    .send({ ...newUserBody, role, ...overrides });

  return response.body.data;
};

const changeRole = (userId: string, role: Role, header = context.adminHeader) =>
  request(application)
    .patch(`/api/users/${userId}/role`)
    .set('Authorization', header)
    .send({ role });

beforeEach(async () => {
  await clearIntegrationTestDatabase();

  const admin = await createTestUser({ role: Role.ADMIN });
  const librarian = await createTestUser({ role: Role.LIBRARIAN });

  context = {
    adminId: admin.id,
    adminHeader: authorizationHeaderFor(admin),
    librarianHeader: authorizationHeaderFor(librarian),
  };
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('admin-only access', () => {
  it('forbids librarians from listing or creating users (403)', async () => {
    const listResponse = await request(application)
      .get('/api/users')
      .set('Authorization', context.librarianHeader);

    const createResponse = await request(application)
      .post('/api/users')
      .set('Authorization', context.librarianHeader)
      .send({ ...newUserBody, role: Role.LIBRARIAN });

    expect(listResponse.status).toBe(StatusCodes.FORBIDDEN);
    expect(createResponse.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('lists users with role filter and word-by-word search', async () => {
    await createUserAsAdmin(Role.LIBRARIAN);

    const roleResponse = await request(application)
      .get(`/api/users?role=${Role.LIBRARIAN}`)
      .set('Authorization', context.adminHeader);

    const searchResponse = await request(application)
      .get(`/api/users?search=${encodeURIComponent('רון שמש')}`)
      .set('Authorization', context.adminHeader);

    expect(roleResponse.body.data).toHaveLength(2);
    expect(searchResponse.body.data).toHaveLength(1);
    expect(searchResponse.body.data[0]).not.toHaveProperty('passwordHash');
  });
});

describe('creating and updating users', () => {
  it('creates a librarian account that can log in, and audits it', async () => {
    const createdUser = await createUserAsAdmin(Role.LIBRARIAN);

    expect(createdUser).toMatchObject({ role: Role.LIBRARIAN, memberId: null });

    const loginResponse = await request(application)
      .post('/api/auth/login')
      .send({ email: newUserBody.email, password: newUserBody.password });

    expect(loginResponse.status).toBe(StatusCodes.OK);

    const auditActions = (await findAuditLogEntriesForRecord(createdUser.id)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toContain(ActionType.USER_CREATED);
  });

  it('creates a MEMBER account together with its membership', async () => {
    const createdUser = await createUserAsAdmin(Role.MEMBER);

    expect(createdUser.role).toBe(Role.MEMBER);
    expect(createdUser.memberId).toEqual(expect.any(String));
    expect(createdUser.membershipStatus).toBe(RecordStatus.ACTIVE);
  });

  it('rejects a duplicate email (409)', async () => {
    await createUserAsAdmin(Role.VIEWER);

    const response = await request(application)
      .post('/api/users')
      .set('Authorization', context.adminHeader)
      .send({ ...newUserBody, role: Role.VIEWER });

    expect(response.status).toBe(StatusCodes.CONFLICT);
  });

  it('updates details including the email', async () => {
    const createdUser = await createUserAsAdmin(Role.VIEWER);

    const response = await request(application)
      .patch(`/api/users/${createdUser.id}`)
      .set('Authorization', context.adminHeader)
      .send({
        firstName: 'רון',
        lastName: 'שמש',
        email: 'ron.new@example.com',
        phoneNumber: newUserBody.phoneNumber,
        address: newUserBody.address,
      });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.email).toBe('ron.new@example.com');
  });
});

describe('roles and membership', () => {
  it('creates a membership when a guest becomes MEMBER and disables it when demoted', async () => {
    const guest = await createUserAsAdmin(Role.VIEWER);

    const promoteResponse = await changeRole(guest.id, Role.MEMBER);

    expect(promoteResponse.status).toBe(StatusCodes.OK);
    expect(promoteResponse.body.data.membershipStatus).toBe(RecordStatus.ACTIVE);

    const demoteResponse = await changeRole(guest.id, Role.VIEWER);

    expect(demoteResponse.body.data.membershipStatus).toBe(RecordStatus.DISABLED);

    const promoteAgainResponse = await changeRole(guest.id, Role.MEMBER);

    expect(promoteAgainResponse.body.data.membershipStatus).toBe(RecordStatus.ACTIVE);
    expect(promoteAgainResponse.body.data.memberId).toBe(promoteResponse.body.data.memberId);

    const memberAuditActions = (
      await findAuditLogEntriesForRecord(promoteResponse.body.data.memberId)
    ).map((entry) => entry.actionType);

    expect(memberAuditActions).toEqual([
      ActionType.MEMBER_CREATED,
      ActionType.MEMBER_DISABLED,
      ActionType.MEMBER_REACTIVATED,
    ]);
  });

  it('rejects setting the same role (409)', async () => {
    const librarian = await createUserAsAdmin(Role.LIBRARIAN);

    const response = await changeRole(librarian.id, Role.LIBRARIAN);

    expect(response.status).toBe(StatusCodes.CONFLICT);
  });
});

describe('admin safety rules', () => {
  it('forbids an admin from changing their own role or disabling themselves (403)', async () => {
    const roleResponse = await changeRole(context.adminId, Role.LIBRARIAN);

    const disableResponse = await request(application)
      .post(`/api/users/${context.adminId}/disable`)
      .set('Authorization', context.adminHeader);

    expect(roleResponse.status).toBe(StatusCodes.FORBIDDEN);
    expect(disableResponse.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('hands the admin role over: the old admin becomes a disabled viewer, still a viewer when reactivated', async () => {
    const librarian = await createUserAsAdmin(Role.LIBRARIAN);

    const response = await changeRole(librarian.id, Role.ADMIN);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.role).toBe(Role.ADMIN);

    // The old admin's session ends at once
    const oldAdminRequest = await request(application)
      .get('/api/users')
      .set('Authorization', context.adminHeader);

    expect(oldAdminRequest.status).toBe(StatusCodes.UNAUTHORIZED);

    const newAdminHeader = authorizationHeaderFor({ ...librarian, role: Role.ADMIN });

    const reactivateResponse = await request(application)
      .post(`/api/users/${context.adminId}/reactivate`)
      .set('Authorization', newAdminHeader);

    expect(reactivateResponse.body.data).toMatchObject({
      role: Role.VIEWER,
      status: RecordStatus.ACTIVE,
    });

    const auditActions = (await findAuditLogEntriesForRecord(context.adminId)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toEqual(
      expect.arrayContaining([ActionType.USER_ROLE_CHANGED, ActionType.USER_DISABLED]),
    );
  });

  it('creating a new ADMIN also hands the role over', async () => {
    const newAdmin = await createUserAsAdmin(Role.ADMIN);

    expect(newAdmin.role).toBe(Role.ADMIN);

    const oldAdminRequest = await request(application)
      .get('/api/users')
      .set('Authorization', context.adminHeader);

    expect(oldAdminRequest.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('refuses to make a disabled account the admin (409 with a code)', async () => {
    const librarian = await createUserAsAdmin(Role.LIBRARIAN);

    await request(application)
      .post(`/api/users/${librarian.id}/disable`)
      .set('Authorization', context.adminHeader);

    const response = await changeRole(librarian.id, Role.ADMIN);

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.error.code).toBe(BusinessErrorCode.ADMIN_HANDOVER_TARGET_NOT_ACTIVE);
  });

  it('disables and reactivates an account; a disabled account cannot log in', async () => {
    const librarian = await createUserAsAdmin(Role.LIBRARIAN);

    const disableResponse = await request(application)
      .post(`/api/users/${librarian.id}/disable`)
      .set('Authorization', context.adminHeader);

    expect(disableResponse.body.data.status).toBe(RecordStatus.DISABLED);

    const loginResponse = await request(application)
      .post('/api/auth/login')
      .send({ email: newUserBody.email, password: newUserBody.password });

    expect(loginResponse.status).toBe(StatusCodes.UNAUTHORIZED);

    const reactivateResponse = await request(application)
      .post(`/api/users/${librarian.id}/reactivate`)
      .set('Authorization', context.adminHeader);

    expect(reactivateResponse.body.data.status).toBe(RecordStatus.ACTIVE);

    const auditActions = (await findAuditLogEntriesForRecord(librarian.id)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toEqual(
      expect.arrayContaining([ActionType.USER_DISABLED, ActionType.USER_REACTIVATED]),
    );
  });
});
