import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Role } from '@prisma/client';
import { Permission } from '@library/shared';
import { requireAuthentication } from '../../middlewares/auth/require-authentication.middleware.ts';
import { authorizePermission } from '../../middlewares/auth/authorize-permission.middleware.ts';
import { errorMiddleware } from '../../middlewares/error/error.middleware.ts';
import {
  clearIntegrationTestDatabase,
  createTestUser,
  disconnectIntegrationTestDatabase,
  updateTestUser,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

// A tiny app with one admin-only route, protected exactly like real routes will be
const createApplicationWithAdminOnlyRoute = () => {
  const application = express();

  application.post(
    '/books/:id/disable',
    requireAuthentication,
    authorizePermission(Permission.BOOKS_DISABLE),
    (req, res) => {
      res
        .status(StatusCodes.OK)
        .json({ success: true, data: { userId: req.user?.id, memberId: req.user?.memberId } });
    },
  );

  application.use(errorMiddleware);

  return application;
};

const application = createApplicationWithAdminOnlyRoute();

beforeEach(async () => {
  await clearIntegrationTestDatabase();
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('requireAuthentication + authorizePermission', () => {
  it('allows an admin (200)', async () => {
    const admin = await createTestUser({ role: Role.ADMIN });

    const response = await request(application)
      .post('/books/1/disable')
      .set('Authorization', authorizationHeaderFor(admin));

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.userId).toBe(admin.id);
  });

  it.each([Role.LIBRARIAN, Role.MEMBER, Role.VIEWER])('forbids a %s (403)', async (role) => {
    const user = await createTestUser({ role });

    const response = await request(application)
      .post('/books/1/disable')
      .set('Authorization', authorizationHeaderFor(user));

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.body.success).toBe(false);
  });

  it('rejects a request without a token (401)', async () => {
    const response = await request(application).post('/books/1/disable');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('uses the role from the database, not the token, so role changes apply immediately', async () => {
    const user = await createTestUser({ role: Role.VIEWER });

    const tokenIssuedWhileViewer = authorizationHeaderFor(user);

    await updateTestUser(user.id, { role: Role.ADMIN });

    const response = await request(application)
      .post('/books/1/disable')
      .set('Authorization', tokenIssuedWhileViewer);

    expect(response.status).toBe(StatusCodes.OK);
  });

  it('attaches the member id for MEMBER users', async () => {
    const member = await createTestUser({ role: Role.MEMBER });

    const memberApplication = express();

    memberApplication.get('/whoami', requireAuthentication, (req, res) => {
      res.json({ memberId: req.user?.memberId });
    });

    const response = await request(memberApplication)
      .get('/whoami')
      .set('Authorization', authorizationHeaderFor(member));

    expect(response.body.memberId).toBe(member.member?.id);
  });
});
