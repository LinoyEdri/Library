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
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

type TestContext = {
  adminHeader: string;
  librarianHeader: string;
  viewerHeader: string;
};

let context: TestContext;

const newPersonBody = {
  mode: 'newPerson',
  firstName: 'נועה',
  lastName: 'ברק',
  email: 'noa.barak@example.com',
  password: 'MemberPassword1',
  phoneNumber: '0521234567',
  address: {
    street: 'הרצל',
    houseNumber: '10',
    apartmentOrUnit: '3',
    city: 'חיפה',
  },
};

// Registers a new person as a member through the API and returns the response body data
const createNewPersonMember = async (body: object = newPersonBody) => {
  const response = await request(application)
    .post('/api/members')
    .set('Authorization', context.librarianHeader)
    .send(body);

  return response.body.data;
};

beforeEach(async () => {
  await clearIntegrationTestDatabase();

  const admin = await createTestUser({ role: Role.ADMIN });
  const librarian = await createTestUser({ role: Role.LIBRARIAN });
  const viewer = await createTestUser({ role: Role.VIEWER });

  context = {
    adminHeader: authorizationHeaderFor(admin),
    librarianHeader: authorizationHeaderFor(librarian),
    viewerHeader: authorizationHeaderFor(viewer),
  };
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('creating members', () => {
  it('registers a new person: account, address and membership, all audited', async () => {
    const response = await request(application)
      .post('/api/members')
      .set('Authorization', context.librarianHeader)
      .send(newPersonBody);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.data).toMatchObject({
      firstName: 'נועה',
      email: 'noa.barak@example.com',
      status: RecordStatus.ACTIVE,
    });

    const newUser = await findUserById(response.body.data.userId);

    expect(newUser?.role).toBe(Role.MEMBER);

    const loginResponse = await request(application)
      .post('/api/auth/login')
      .send({ email: 'noa.barak@example.com', password: 'MemberPassword1' });

    expect(loginResponse.status).toBe(StatusCodes.OK);

    const memberAuditActions = (await findAuditLogEntriesForRecord(response.body.data.id)).map(
      (entry) => entry.actionType,
    );

    const userAuditActions = (await findAuditLogEntriesForRecord(response.body.data.userId)).map(
      (entry) => entry.actionType,
    );

    expect(memberAuditActions).toEqual([ActionType.MEMBER_CREATED]);
    expect(userAuditActions).toContain(ActionType.USER_CREATED);
  });

  it('turns an existing guest account into a member and changes its role', async () => {
    const guest = await createTestUser({ role: Role.VIEWER });

    const response = await request(application)
      .post('/api/members')
      .set('Authorization', context.adminHeader)
      .send({ mode: 'existingUser', userId: guest.id });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect((await findUserById(guest.id))?.role).toBe(Role.MEMBER);

    const userAuditActions = (await findAuditLogEntriesForRecord(guest.id)).map(
      (entry) => entry.actionType,
    );

    expect(userAuditActions).toContain(ActionType.USER_ROLE_CHANGED);
  });

  it('rejects linking a staff account (400) and a user who is already a member (409)', async () => {
    const librarian = await createTestUser({ role: Role.LIBRARIAN });
    const existingMember = await createTestUser({ role: Role.MEMBER });

    const staffResponse = await request(application)
      .post('/api/members')
      .set('Authorization', context.adminHeader)
      .send({ mode: 'existingUser', userId: librarian.id });

    const alreadyMemberResponse = await request(application)
      .post('/api/members')
      .set('Authorization', context.adminHeader)
      .send({ mode: 'existingUser', userId: existingMember.id });

    expect(staffResponse.status).toBe(StatusCodes.BAD_REQUEST);
    expect(alreadyMemberResponse.status).toBe(StatusCodes.CONFLICT);
  });

  it('rejects an email that is already registered (409)', async () => {
    await createNewPersonMember();

    const response = await request(application)
      .post('/api/members')
      .set('Authorization', context.librarianHeader)
      .send(newPersonBody);

    expect(response.status).toBe(StatusCodes.CONFLICT);
  });

  it('forbids a viewer from creating members (403)', async () => {
    const response = await request(application)
      .post('/api/members')
      .set('Authorization', context.viewerHeader)
      .send(newPersonBody);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('lists only active guest accounts without a membership as candidates', async () => {
    const guest = await createTestUser({ role: Role.VIEWER, email: 'guest.candidate@example.com' });

    await createTestUser({ role: Role.MEMBER, email: 'already.member@example.com' });

    const response = await request(application)
      .get('/api/members/candidates?search=candidate')
      .set('Authorization', context.librarianHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data).toEqual([expect.objectContaining({ userId: guest.id })]);
  });
});

describe('viewing members', () => {
  it.each([
    ['last name', 'ברק'],
    ['full name', 'נועה ברק'],
    ['part of the email', 'noa.barak@'],
    ['phone with dashes', '052-123-4567'],
  ])('lets staff search members by %s', async (_searchKind, searchText) => {
    await createNewPersonMember();

    const response = await request(application)
      .get(`/api/members?search=${encodeURIComponent(searchText)}`)
      .set('Authorization', context.librarianHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.totalItems).toBe(1);
  });

  it('returns no members when one of the search words does not match', async () => {
    await createNewPersonMember();

    const response = await request(application)
      .get(`/api/members?search=${encodeURIComponent('נועה כהן')}`)
      .set('Authorization', context.librarianHeader);

    expect(response.body.data).toHaveLength(0);
  });

  it('forbids viewers from listing members (403)', async () => {
    const response = await request(application)
      .get('/api/members')
      .set('Authorization', context.viewerHeader);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });

  it("lets a member open their own membership but not someone else's", async () => {
    const otherMember = await createNewPersonMember();

    const member = await createTestUser({ role: Role.MEMBER });

    const memberHeader = authorizationHeaderFor(member);

    const ownResponse = await request(application)
      .get('/api/members/me')
      .set('Authorization', memberHeader);

    const ownByIdResponse = await request(application)
      .get(`/api/members/${member.member?.id}`)
      .set('Authorization', memberHeader);

    const otherResponse = await request(application)
      .get(`/api/members/${otherMember.id}`)
      .set('Authorization', memberHeader);

    expect(ownResponse.status).toBe(StatusCodes.OK);
    expect(ownResponse.body.data.id).toBe(member.member?.id);
    expect(ownByIdResponse.status).toBe(StatusCodes.OK);
    expect(otherResponse.status).toBe(StatusCodes.FORBIDDEN);
  });
});

describe('updating, disabling and reactivating members', () => {
  it('updates personal details and audits the change', async () => {
    const member = await createNewPersonMember();

    const response = await request(application)
      .patch(`/api/members/${member.id}`)
      .set('Authorization', context.librarianHeader)
      .send({
        firstName: 'נועה',
        lastName: 'ברק-לוי',
        phoneNumber: '0521234567',
        address: newPersonBody.address,
      });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.lastName).toBe('ברק-לוי');

    const auditActions = (await findAuditLogEntriesForRecord(member.id)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toEqual([ActionType.MEMBER_CREATED, ActionType.MEMBER_UPDATED]);
  });

  it('disables (member becomes a guest) and reactivates (back to member); login keeps working', async () => {
    const member = await createNewPersonMember();

    const disableResponse = await request(application)
      .post(`/api/members/${member.id}/disable`)
      .set('Authorization', context.librarianHeader);

    expect(disableResponse.status).toBe(StatusCodes.OK);
    expect(disableResponse.body.data.status).toBe(RecordStatus.DISABLED);
    expect(disableResponse.body.data.accountStatus).toBe(RecordStatus.ACTIVE);
    expect((await findUserById(member.userId))?.role).toBe(Role.VIEWER);

    const loginResponse = await request(application)
      .post('/api/auth/login')
      .send({ email: newPersonBody.email, password: newPersonBody.password });

    expect(loginResponse.status).toBe(StatusCodes.OK);

    const secondDisableResponse = await request(application)
      .post(`/api/members/${member.id}/disable`)
      .set('Authorization', context.librarianHeader);

    expect(secondDisableResponse.status).toBe(StatusCodes.CONFLICT);

    const reactivateResponse = await request(application)
      .post(`/api/members/${member.id}/reactivate`)
      .set('Authorization', context.adminHeader);

    expect(reactivateResponse.body.data.status).toBe(RecordStatus.ACTIVE);
    expect((await findUserById(member.userId))?.role).toBe(Role.MEMBER);

    const auditActions = (await findAuditLogEntriesForRecord(member.id)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toEqual([
      ActionType.MEMBER_CREATED,
      ActionType.MEMBER_DISABLED,
      ActionType.MEMBER_REACTIVATED,
    ]);
  });
});
