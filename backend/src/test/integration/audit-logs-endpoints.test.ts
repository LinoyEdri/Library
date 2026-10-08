import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, EntityType, Role } from '@prisma/client';
import { createApp } from '../../app.ts';
import prisma from '../../prisma/prisma.ts';
import {
  clearIntegrationTestDatabase,
  createTestAuditLogEntry,
  createTestBookWithCopies,
  createTestUser,
  disconnectIntegrationTestDatabase,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

type TestContext = {
  adminHeader: string;
  librarianHeader: string;
  memberHeader: string;
  adminId: string;
  librarianId: string;
  oldEntryId: string;
  loanEntryId: string;
  newestEntryId: string;
};

let context: TestContext;

const listAuditLogs = (query = '') =>
  request(application).get(`/api/audit-logs${query}`).set('Authorization', context.adminHeader);

const listedIds = (response: request.Response) =>
  response.body.data.map((entry: { id: string }) => entry.id);

// Three entries: an old book update by the admin, a loan by the librarian, a recent book update
beforeEach(async () => {
  await clearIntegrationTestDatabase();

  const admin = await createTestUser({ role: Role.ADMIN });
  const librarian = await createTestUser({ role: Role.LIBRARIAN });
  const member = await createTestUser({ role: Role.MEMBER });

  const oldEntry = await createTestAuditLogEntry(admin, {
    createdDate: new Date(2026, 0, 15, 10, 0),
    affectedRecordId: 'book-1',
  });

  const loanEntry = await createTestAuditLogEntry(librarian, {
    actionType: ActionType.LOAN_CREATED,
    affectedType: EntityType.LOAN,
    affectedRecordId: 'loan-1',
    createdDate: new Date(2026, 1, 10, 23, 30),
  });

  const newestEntry = await createTestAuditLogEntry(admin, {
    createdDate: new Date(2026, 2, 1, 8, 0),
    affectedRecordId: 'book-2',
  });

  context = {
    adminHeader: authorizationHeaderFor(admin),
    librarianHeader: authorizationHeaderFor(librarian),
    memberHeader: authorizationHeaderFor(member),
    adminId: admin.id,
    librarianId: librarian.id,
    oldEntryId: oldEntry.id,
    loanEntryId: loanEntry.id,
    newestEntryId: newestEntry.id,
  };
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('GET /api/audit-logs', () => {
  it('lists every entry newest first, with the acting user and stored values', async () => {
    const response = await listAuditLogs();

    expect(response.status).toBe(StatusCodes.OK);
    expect(listedIds(response)).toEqual([
      context.newestEntryId,
      context.loanEntryId,
      context.oldEntryId,
    ]);
    expect(response.body.meta.totalItems).toBe(3);
    expect(response.body.data[0]).toMatchObject({
      actionType: ActionType.BOOK_UPDATED,
      actionUserRole: Role.ADMIN,
      actionUser: { id: context.adminId },
      previousValue: { title: 'לפני' },
      newValue: { title: 'אחרי' },
    });
  });

  it.each([
    ['action', `?actionType=${ActionType.LOAN_CREATED}`, () => [context.loanEntryId]],
    ['record type', `?affectedType=${EntityType.LOAN}`, () => [context.loanEntryId]],
    ['record id', '?affectedRecordId=book-1', () => [context.oldEntryId]],
    ['oldest first', '?sortOrder=asc&pageSize=1', () => [context.oldEntryId]],
  ])('filters by %s', async (_label, query, expectedIds) => {
    const response = await listAuditLogs(query);

    expect(listedIds(response)).toEqual(expectedIds());
  });

  it('numbers entries 1, 2, 3 in the order they were written, and filters by that number', async () => {
    const response = await listAuditLogs('?sortOrder=asc');

    expect(response.body.data.map((entry: { entryNumber: number }) => entry.entryNumber)).toEqual([
      1, 2, 3,
    ]);

    const filteredResponse = await listAuditLogs('?entryNumber=2');

    expect(listedIds(filteredResponse)).toEqual([context.loanEntryId]);
  });

  it('names the changed record and every record id inside the values', async () => {
    const librarian = { id: context.librarianId, role: Role.LIBRARIAN };

    const { book } = await createTestBookWithCopies(context.librarianId);

    const bookWithPublisher = await prisma.book.findUniqueOrThrow({
      where: { id: book.id },
      include: { publisher: true },
    });

    await createTestAuditLogEntry(librarian, {
      affectedRecordId: book.id,
      newValue: { title: book.title, publisherId: bookWithPublisher.publisherId },
    });

    const response = await listAuditLogs(`?affectedRecordId=${book.id}`);

    expect(response.body.data[0]).toMatchObject({
      affectedRecordName: book.title,
      referenceNames: {
        [book.id]: book.title,
        [bookWithPublisher.publisherId]: bookWithPublisher.publisher.name,
      },
    });
  });

  it('filters by the acting user', async () => {
    const response = await listAuditLogs(`?actionUserId=${context.librarianId}`);

    expect(listedIds(response)).toEqual([context.loanEntryId]);
  });

  it('includes both whole days of the date range', async () => {
    const response = await listAuditLogs('?fromDate=2026-01-15&toDate=2026-02-10');

    expect(listedIds(response)).toEqual([context.loanEntryId, context.oldEntryId]);
  });

  it('rejects an end date before the start date', async () => {
    const response = await listAuditLogs('?fromDate=2026-02-10&toDate=2026-01-15');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('is only open to admins', async () => {
    expect((await request(application).get('/api/audit-logs')).status).toBe(
      StatusCodes.UNAUTHORIZED,
    );

    for (const header of [context.librarianHeader, context.memberHeader]) {
      const response = await request(application)
        .get('/api/audit-logs')
        .set('Authorization', header);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    }
  });
});

describe('GET /api/audit-logs/:id', () => {
  it('returns one entry, or 404 for an unknown id', async () => {
    const response = await request(application)
      .get(`/api/audit-logs/${context.loanEntryId}`)
      .set('Authorization', context.adminHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.affectedRecordId).toBe('loan-1');

    const missingResponse = await request(application)
      .get('/api/audit-logs/00000000-0000-7000-8000-000000000000')
      .set('Authorization', context.adminHeader);

    expect(missingResponse.status).toBe(StatusCodes.NOT_FOUND);
  });
});

describe('append-only audit log table', () => {
  it('rejects changing or deleting an entry at the database level', async () => {
    await expect(
      prisma.auditLog.update({
        where: { id: context.oldEntryId },
        data: { affectedRecordId: 'changed' },
      }),
    ).rejects.toThrow();

    await expect(prisma.auditLog.delete({ where: { id: context.oldEntryId } })).rejects.toThrow();

    const storedEntry = await prisma.auditLog.findUnique({ where: { id: context.oldEntryId } });

    expect(storedEntry?.affectedRecordId).toBe('book-1');
  });

  it('rejects adding an entry from outside the application (e.g. Prisma Studio)', async () => {
    const { actionUserId, actionUserRole } = await prisma.auditLog.findUniqueOrThrow({
      where: { id: context.oldEntryId },
    });

    await expect(
      prisma.auditLog.create({
        data: {
          actionType: ActionType.BOOK_UPDATED,
          affectedType: EntityType.BOOK,
          actionUserId,
          actionUserRole,
        },
      }),
    ).rejects.toThrow();
  });
});
