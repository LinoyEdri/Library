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
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

// The three resources behave the same; only their fields and audit actions differ
const catalogResources = [
  {
    path: '/api/authors',
    createBody: { firstName: 'עמוס', lastName: 'עוז', biography: 'סופר ישראלי' },
    updateBody: { firstName: 'עמוס', lastName: 'קלאוזנר', biography: null },
    searchText: 'עוז',
    hasUniqueName: false,
    auditActions: {
      created: ActionType.AUTHOR_CREATED,
      updated: ActionType.AUTHOR_UPDATED,
      disabled: ActionType.AUTHOR_DISABLED,
      reactivated: ActionType.AUTHOR_REACTIVATED,
    },
  },
  {
    path: '/api/publishers',
    createBody: { name: 'כנרת זמורה', description: 'הוצאה לאור' },
    updateBody: { name: 'כנרת זמורה דביר', description: null },
    searchText: 'כנרת',
    hasUniqueName: true,
    auditActions: {
      created: ActionType.PUBLISHER_CREATED,
      updated: ActionType.PUBLISHER_UPDATED,
      disabled: ActionType.PUBLISHER_DISABLED,
      reactivated: ActionType.PUBLISHER_REACTIVATED,
    },
  },
  {
    path: '/api/categories',
    createBody: { name: 'רומן' },
    updateBody: { name: 'רומן היסטורי' },
    searchText: 'רומן',
    hasUniqueName: true,
    auditActions: {
      created: ActionType.CATEGORY_CREATED,
      updated: ActionType.CATEGORY_UPDATED,
      disabled: ActionType.CATEGORY_DISABLED,
      reactivated: ActionType.CATEGORY_REACTIVATED,
    },
  },
];

type CatalogResource = (typeof catalogResources)[number];

// Creates a record through the API as the given admin and returns its id
const createRecordAsAdmin = async (
  resource: CatalogResource,
  adminAuthorizationHeader: string,
  body: object = resource.createBody,
): Promise<string> => {
  const response = await request(application)
    .post(resource.path)
    .set('Authorization', adminAuthorizationHeader)
    .send(body);

  return response.body.data.id;
};

beforeEach(async () => {
  await clearIntegrationTestDatabase();
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe.each(catalogResources)('$path', (resource) => {
  it('lets an admin create, update, disable and reactivate, auditing every step', async () => {
    const admin = await createTestUser({ role: Role.ADMIN });

    const adminHeader = authorizationHeaderFor(admin);

    const createResponse = await request(application)
      .post(resource.path)
      .set('Authorization', adminHeader)
      .send(resource.createBody);

    expect(createResponse.status).toBe(StatusCodes.CREATED);
    expect(createResponse.body.data.status).toBe(RecordStatus.ACTIVE);

    const recordId = createResponse.body.data.id;

    const updateResponse = await request(application)
      .patch(`${resource.path}/${recordId}`)
      .set('Authorization', adminHeader)
      .send(resource.updateBody);

    expect(updateResponse.status).toBe(StatusCodes.OK);
    expect(updateResponse.body.data).toMatchObject(resource.updateBody);

    const disableResponse = await request(application)
      .post(`${resource.path}/${recordId}/disable`)
      .set('Authorization', adminHeader);

    expect(disableResponse.status).toBe(StatusCodes.OK);
    expect(disableResponse.body.data.status).toBe(RecordStatus.DISABLED);
    expect(disableResponse.body.data.disabledDate).toEqual(expect.any(String));

    const reactivateResponse = await request(application)
      .post(`${resource.path}/${recordId}/reactivate`)
      .set('Authorization', adminHeader);

    expect(reactivateResponse.status).toBe(StatusCodes.OK);
    expect(reactivateResponse.body.data.status).toBe(RecordStatus.ACTIVE);
    expect(reactivateResponse.body.data.disabledDate).toBeNull();

    const auditActions = (await findAuditLogEntriesForRecord(recordId)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toEqual([
      resource.auditActions.created,
      resource.auditActions.updated,
      resource.auditActions.disabled,
      resource.auditActions.reactivated,
    ]);
  });

  it.each([Role.LIBRARIAN, Role.MEMBER, Role.VIEWER])(
    'forbids a %s from creating (403)',
    async (role) => {
      const user = await createTestUser({ role });

      const response = await request(application)
        .post(resource.path)
        .set('Authorization', authorizationHeaderFor(user))
        .send(resource.createBody);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    },
  );

  it('returns 401 without a token', async () => {
    const response = await request(application).get(resource.path);

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('shows disabled records to admins only', async () => {
    const admin = await createTestUser({ role: Role.ADMIN });
    const viewer = await createTestUser({ role: Role.VIEWER });

    const adminHeader = authorizationHeaderFor(admin);

    const recordId = await createRecordAsAdmin(resource, adminHeader);

    await request(application)
      .post(`${resource.path}/${recordId}/disable`)
      .set('Authorization', adminHeader);

    const viewerListResponse = await request(application)
      .get(resource.path)
      .set('Authorization', authorizationHeaderFor(viewer));

    const viewerGetResponse = await request(application)
      .get(`${resource.path}/${recordId}`)
      .set('Authorization', authorizationHeaderFor(viewer));

    const adminListResponse = await request(application)
      .get(`${resource.path}?status=${RecordStatus.DISABLED}`)
      .set('Authorization', adminHeader);

    expect(viewerListResponse.body.data).toHaveLength(0);
    expect(viewerGetResponse.status).toBe(StatusCodes.NOT_FOUND);
    expect(adminListResponse.body.data).toHaveLength(1);
  });

  it('searches and paginates, returning paging info in meta', async () => {
    const admin = await createTestUser({ role: Role.ADMIN });

    const adminHeader = authorizationHeaderFor(admin);

    await createRecordAsAdmin(resource, adminHeader);

    const response = await request(application)
      .get(`${resource.path}?search=${encodeURIComponent(resource.searchText)}&pageSize=5`)
      .set('Authorization', adminHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta).toEqual({ page: 1, pageSize: 5, totalItems: 1, totalPages: 1 });
  });

  it('returns 409 when disabling an already disabled record', async () => {
    const admin = await createTestUser({ role: Role.ADMIN });

    const adminHeader = authorizationHeaderFor(admin);

    const recordId = await createRecordAsAdmin(resource, adminHeader);

    await request(application)
      .post(`${resource.path}/${recordId}/disable`)
      .set('Authorization', adminHeader);

    const secondDisableResponse = await request(application)
      .post(`${resource.path}/${recordId}/disable`)
      .set('Authorization', adminHeader);

    expect(secondDisableResponse.status).toBe(StatusCodes.CONFLICT);
  });

  it('returns 400 for an invalid id', async () => {
    const admin = await createTestUser({ role: Role.ADMIN });

    const response = await request(application)
      .get(`${resource.path}/not-a-uuid`)
      .set('Authorization', authorizationHeaderFor(admin));

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it.runIf(resource.hasUniqueName)('returns 409 for a duplicate name', async () => {
    const admin = await createTestUser({ role: Role.ADMIN });

    const adminHeader = authorizationHeaderFor(admin);

    await createRecordAsAdmin(resource, adminHeader);

    const duplicateResponse = await request(application)
      .post(resource.path)
      .set('Authorization', adminHeader)
      .send(resource.createBody);

    expect(duplicateResponse.status).toBe(StatusCodes.CONFLICT);
  });
});
