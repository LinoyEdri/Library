import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, CopyStatus, Role } from '@prisma/client';
import { DashboardKind } from '@library/shared';
import { createApp } from '../../app.ts';
import {
  clearIntegrationTestDatabase,
  createTestBookWithCopies,
  createTestUser,
  disconnectIntegrationTestDatabase,
  setTestLoanDueDate,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

type TestContext = {
  adminHeader: string;
  librarianHeader: string;
  memberHeader: string;
  viewerHeader: string;
  overdueLoanId: string;
  requestedLoanId: string;
  otherMemberLoanId: string;
};

let context: TestContext;

const YESTERDAY = new Date(Date.now() - 24 * 60 * 60 * 1000);

const getDashboard = (header: string) =>
  request(application).get('/api/dashboard').set('Authorization', header);

// Two loans for the member (one late, one waiting for return) and one for another member
beforeEach(async () => {
  await clearIntegrationTestDatabase();

  const admin = await createTestUser({ role: Role.ADMIN });
  const librarian = await createTestUser({ role: Role.LIBRARIAN });
  const member = await createTestUser({ role: Role.MEMBER });
  const otherMember = await createTestUser({ role: Role.MEMBER });
  const viewer = await createTestUser({ role: Role.VIEWER });

  const { book } = await createTestBookWithCopies(librarian.id, 3);

  const librarianHeader = authorizationHeaderFor(librarian);
  const memberHeader = authorizationHeaderFor(member);

  const lendBook = async (memberId: string) => {
    const response = await request(application)
      .post('/api/loans')
      .set('Authorization', librarianHeader)
      .send({ memberId, bookId: book.id });

    return response.body.data.id as string;
  };

  const overdueLoanId = await lendBook(member.member!.id);
  const requestedLoanId = await lendBook(member.member!.id);
  const otherMemberLoanId = await lendBook(otherMember.member!.id);

  await setTestLoanDueDate(overdueLoanId, YESTERDAY);

  await request(application)
    .post(`/api/loans/${requestedLoanId}/return-request`)
    .set('Authorization', memberHeader);

  context = {
    adminHeader: authorizationHeaderFor(admin),
    librarianHeader,
    memberHeader,
    viewerHeader: authorizationHeaderFor(viewer),
    overdueLoanId,
    requestedLoanId,
    otherMemberLoanId,
  };
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('GET /api/dashboard', () => {
  it('requires a logged-in user and is closed to guests', async () => {
    expect((await request(application).get('/api/dashboard')).status).toBe(
      StatusCodes.UNAUTHORIZED,
    );

    expect((await getDashboard(context.viewerHeader)).status).toBe(StatusCodes.FORBIDDEN);
  });

  it('gives a member only their own loans, nearest due date first', async () => {
    const response = await getDashboard(context.memberHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.kind).toBe(DashboardKind.MEMBER);
    expect(response.body.data.statistics).toEqual({
      openLoans: 2,
      overdueLoans: 1,
      pendingReturns: 1,
      maxActiveLoans: 5,
    });
    expect(response.body.data.openLoans.map((loan: { id: string }) => loan.id)).toEqual([
      context.overdueLoanId,
      context.requestedLoanId,
    ]);
  });

  it('gives a librarian the library loan counts and the short work lists', async () => {
    await request(application)
      .post(`/api/loans/${context.otherMemberLoanId}/return`)
      .set('Authorization', context.librarianHeader);

    const response = await getDashboard(context.librarianHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.kind).toBe(DashboardKind.STAFF);
    expect(response.body.data.statistics).toEqual({
      openLoans: 2,
      overdueLoans: 1,
      pendingReturns: 1,
      loansCreatedToday: 3,
      returnsProcessedToday: 1,
    });
    expect(response.body.data.overdueLoans[0].id).toBe(context.overdueLoanId);
    expect(response.body.data.pendingReturnLoans[0].id).toBe(context.requestedLoanId);
    expect(response.body.data.totals).toBeUndefined();
  });

  it('gives an admin the staff numbers plus library totals and recent audit entries', async () => {
    const response = await getDashboard(context.adminHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.kind).toBe(DashboardKind.ADMIN);
    expect(response.body.data.statistics.openLoans).toBe(3);
    expect(response.body.data.totals).toEqual({
      activeUsersByRole: { ADMIN: 1, LIBRARIAN: 1, MEMBER: 2, VIEWER: 1 },
      activeBooks: 1,
      activeMembers: 2,
      copiesByStatus: {
        [CopyStatus.AVAILABLE]: 0,
        [CopyStatus.ON_LOAN]: 3,
        [CopyStatus.DISABLED]: 0,
        [CopyStatus.LOST]: 0,
        [CopyStatus.DAMAGED]: 0,
      },
    });

    const [newestEntry] = response.body.data.recentAuditEntries;

    expect(response.body.data.recentAuditEntries).toHaveLength(4);
    expect(newestEntry).toMatchObject({
      actionType: ActionType.LOAN_RETURN_REQUESTED,
      affectedRecordId: context.requestedLoanId,
      actionUserRole: Role.MEMBER,
      actionUser: { firstName: 'Test' },
    });
  });
});
