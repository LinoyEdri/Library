import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, CopyStatus, LoanStatus, RecordStatus, Role } from '@prisma/client';
import { BusinessErrorCode, SystemSettingKey } from '@library/shared';
import { createApp } from '../../app.ts';
import { loanService } from '../../services/loan.service.ts';
import {
  clearIntegrationTestDatabase,
  createTestBookWithCopies,
  createTestUser,
  disconnectIntegrationTestDatabase,
  findAuditLogEntriesForRecord,
  findCopyById,
  findLoanById,
  setTestBookStatus,
  setTestCopyStatus,
  setTestLoanDueDate,
  setTestMemberStatus,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

type TestContext = {
  adminHeader: string;
  librarianHeader: string;
  memberHeader: string;
  otherMemberHeader: string;
  viewerHeader: string;
  memberId: string;
  otherMemberId: string;
  bookId: string;
  copyIds: string[];
  barcodes: string[];
};

let context: TestContext;

const YESTERDAY = new Date(Date.now() - 24 * 60 * 60 * 1000);

beforeEach(async () => {
  await clearIntegrationTestDatabase();

  const admin = await createTestUser({ role: Role.ADMIN });
  const librarian = await createTestUser({ role: Role.LIBRARIAN });
  const member = await createTestUser({ role: Role.MEMBER });
  const otherMember = await createTestUser({ role: Role.MEMBER });
  const viewer = await createTestUser({ role: Role.VIEWER });

  const { book, copies } = await createTestBookWithCopies(librarian.id, 2);

  context = {
    adminHeader: authorizationHeaderFor(admin),
    librarianHeader: authorizationHeaderFor(librarian),
    memberHeader: authorizationHeaderFor(member),
    otherMemberHeader: authorizationHeaderFor(otherMember),
    viewerHeader: authorizationHeaderFor(viewer),
    memberId: member.member!.id,
    otherMemberId: otherMember.member!.id,
    bookId: book.id,
    copyIds: copies.map((copy) => copy.id),
    barcodes: copies.map((copy) => copy.barcode),
  };
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

// Staff lend a book to a member; returns the response
const createLoan = (body: object, header = context.librarianHeader) =>
  request(application).post('/api/loans').set('Authorization', header).send(body);

// Lends the context book to the main member and returns the loan data
const createMemberLoan = async () => {
  const response = await createLoan({ memberId: context.memberId, bookId: context.bookId });

  return response.body.data;
};

const postLoanAction = (loanId: string, action: string, header: string, body: object = {}) =>
  request(application)
    .post(`/api/loans/${loanId}/${action}`)
    .set('Authorization', header)
    .send(body);

describe('creating loans', () => {
  it('lends the first available copy, sets the due date from the settings and audits it', async () => {
    const response = await createLoan({ memberId: context.memberId, bookId: context.bookId });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.data).toMatchObject({
      status: LoanStatus.ACTIVE,
      member: { id: context.memberId },
      book: { id: context.bookId },
      copy: { id: context.copyIds[0], status: CopyStatus.ON_LOAN },
      isPastDue: false,
    });

    const loanDays =
      (new Date(response.body.data.dueDate).getTime() -
        new Date(response.body.data.createdDate).getTime()) /
      (24 * 60 * 60 * 1000);

    expect(loanDays).toBe(14);

    const auditEntries = await findAuditLogEntriesForRecord(response.body.data.id);

    expect(auditEntries.map((entry) => entry.actionType)).toEqual([ActionType.LOAN_CREATED]);
  });

  it('lends the exact copy when a barcode is given', async () => {
    const response = await createLoan({ memberId: context.memberId, barcode: context.barcodes[1] });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.data.copy.id).toBe(context.copyIds[1]);
  });

  it('uses the loan period setting for the due date', async () => {
    await request(application)
      .patch(`/api/settings/${SystemSettingKey.LOAN_PERIOD_DAYS}`)
      .set('Authorization', context.adminHeader)
      .send({ value: 7 });

    const loan = await createMemberLoan();

    const loanDays =
      (new Date(loan.dueDate).getTime() - new Date(loan.createdDate).getTime()) /
      (24 * 60 * 60 * 1000);

    expect(loanDays).toBe(7);
  });

  it('requires a book or a barcode', async () => {
    const response = await createLoan({ memberId: context.memberId });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it.each([
    [
      'an unknown barcode',
      () => ({ barcode: 'NO-SUCH-BARCODE' }),
      BusinessErrorCode.COPY_NOT_FOUND,
    ],
    [
      'a barcode of another book',
      () => ({ bookId: '00000000-0000-7000-8000-000000000000', barcode: context.barcodes[0] }),
      BusinessErrorCode.COPY_OF_OTHER_BOOK,
    ],
  ])('rejects %s', async (_label, buildTarget, expectedErrorCode) => {
    const response = await createLoan({ memberId: context.memberId, ...buildTarget() });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.error.code).toBe(expectedErrorCode);
  });

  it('rejects a copy that is already on loan', async () => {
    await createLoan({ memberId: context.memberId, barcode: context.barcodes[0] });

    const response = await createLoan({
      memberId: context.otherMemberId,
      barcode: context.barcodes[0],
    });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.error.code).toBe(BusinessErrorCode.COPY_NOT_AVAILABLE);
  });

  it('rejects when no copy of the book is available', async () => {
    await setTestCopyStatus(context.copyIds[0], CopyStatus.LOST);
    await setTestCopyStatus(context.copyIds[1], CopyStatus.DAMAGED);

    const response = await createLoan({ memberId: context.memberId, bookId: context.bookId });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.error.code).toBe(BusinessErrorCode.NO_AVAILABLE_COPY);
  });

  it('rejects a disabled member', async () => {
    await setTestMemberStatus(context.memberId, RecordStatus.DISABLED);

    const response = await createLoan({ memberId: context.memberId, bookId: context.bookId });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.error.code).toBe(BusinessErrorCode.MEMBER_NOT_ACTIVE);
  });

  it('rejects a disabled book', async () => {
    await setTestBookStatus(context.bookId, RecordStatus.DISABLED);

    const response = await createLoan({ memberId: context.memberId, bookId: context.bookId });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.error.code).toBe(BusinessErrorCode.BOOK_NOT_ACTIVE);
  });

  it('enforces the maximum number of open loans per member', async () => {
    await request(application)
      .patch(`/api/settings/${SystemSettingKey.MAX_ACTIVE_LOANS_PER_MEMBER}`)
      .set('Authorization', context.adminHeader)
      .send({ value: 1 });

    await createMemberLoan();

    const response = await createLoan({ memberId: context.memberId, bookId: context.bookId });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body.error.code).toBe(BusinessErrorCode.LOAN_LIMIT_REACHED);
  });

  it('is only allowed for staff', async () => {
    const body = { memberId: context.memberId, bookId: context.bookId };

    expect((await createLoan(body, context.memberHeader)).status).toBe(StatusCodes.FORBIDDEN);
    expect((await createLoan(body, context.viewerHeader)).status).toBe(StatusCodes.FORBIDDEN);
    expect((await request(application).post('/api/loans').send(body)).status).toBe(
      StatusCodes.UNAUTHORIZED,
    );
  });
});

describe('viewing loans', () => {
  it('shows staff every loan and members only their own', async () => {
    await createMemberLoan();
    await createLoan({ memberId: context.otherMemberId, bookId: context.bookId });

    const staffResponse = await request(application)
      .get('/api/loans')
      .set('Authorization', context.adminHeader);

    expect(staffResponse.status).toBe(StatusCodes.OK);
    expect(staffResponse.body.meta.totalItems).toBe(2);

    const memberResponse = await request(application)
      .get(`/api/loans?memberId=${context.otherMemberId}`)
      .set('Authorization', context.memberHeader);

    expect(memberResponse.status).toBe(StatusCodes.OK);
    expect(memberResponse.body.data).toHaveLength(1);
    expect(memberResponse.body.data[0].member.id).toBe(context.memberId);
  });

  it('filters by status and by overdue', async () => {
    const loan = await createMemberLoan();
    await createLoan({ memberId: context.otherMemberId, bookId: context.bookId });

    await setTestLoanDueDate(loan.id, YESTERDAY);

    const overdueResponse = await request(application)
      .get('/api/loans?onlyOverdue=true')
      .set('Authorization', context.librarianHeader);

    expect(overdueResponse.body.data.map((row: { id: string }) => row.id)).toEqual([loan.id]);

    const returnedResponse = await request(application)
      .get(`/api/loans?status=${LoanStatus.RETURNED}`)
      .set('Authorization', context.librarianHeader);

    expect(returnedResponse.body.data).toHaveLength(0);
  });

  it('lets a member open their own loan but not another member’s', async () => {
    const loan = await createMemberLoan();

    const ownResponse = await request(application)
      .get(`/api/loans/${loan.id}`)
      .set('Authorization', context.memberHeader);

    expect(ownResponse.status).toBe(StatusCodes.OK);

    const otherResponse = await request(application)
      .get(`/api/loans/${loan.id}`)
      .set('Authorization', context.otherMemberHeader);

    expect(otherResponse.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('blocks guests and returns 404 for an unknown loan', async () => {
    const viewerResponse = await request(application)
      .get('/api/loans')
      .set('Authorization', context.viewerHeader);

    expect(viewerResponse.status).toBe(StatusCodes.FORBIDDEN);

    const missingResponse = await request(application)
      .get('/api/loans/00000000-0000-7000-8000-000000000000')
      .set('Authorization', context.librarianHeader);

    expect(missingResponse.status).toBe(StatusCodes.NOT_FOUND);
  });
});

describe('return requests', () => {
  it('lets the member request and cancel a return, audited', async () => {
    const loan = await createMemberLoan();

    const requestResponse = await postLoanAction(loan.id, 'return-request', context.memberHeader);

    expect(requestResponse.status).toBe(StatusCodes.OK);
    expect(requestResponse.body.data.status).toBe(LoanStatus.RETURN_REQUESTED);
    expect(requestResponse.body.data.returnRequestedDate).not.toBeNull();

    const cancelResponse = await postLoanAction(
      loan.id,
      'return-request/cancel',
      context.memberHeader,
    );

    expect(cancelResponse.status).toBe(StatusCodes.OK);
    expect(cancelResponse.body.data.status).toBe(LoanStatus.ACTIVE);

    const auditEntries = await findAuditLogEntriesForRecord(loan.id);

    expect(auditEntries.map((entry) => entry.actionType)).toEqual([
      ActionType.LOAN_CREATED,
      ActionType.LOAN_RETURN_REQUESTED,
      ActionType.LOAN_RETURN_REQUEST_CANCELLED,
    ]);
  });

  it('returns a late loan to OVERDUE when the request is cancelled', async () => {
    const loan = await createMemberLoan();

    await setTestLoanDueDate(loan.id, YESTERDAY);
    await postLoanAction(loan.id, 'return-request', context.memberHeader);

    const response = await postLoanAction(loan.id, 'return-request/cancel', context.memberHeader);

    expect(response.body.data.status).toBe(LoanStatus.OVERDUE);
  });

  it('rejects requests on another member’s loan, by staff, or twice in a row', async () => {
    const loan = await createMemberLoan();

    expect(
      (await postLoanAction(loan.id, 'return-request', context.otherMemberHeader)).status,
    ).toBe(StatusCodes.FORBIDDEN);

    expect((await postLoanAction(loan.id, 'return-request', context.librarianHeader)).status).toBe(
      StatusCodes.FORBIDDEN,
    );

    await postLoanAction(loan.id, 'return-request', context.memberHeader);

    const repeatedResponse = await postLoanAction(loan.id, 'return-request', context.memberHeader);

    expect(repeatedResponse.status).toBe(StatusCodes.CONFLICT);
    expect(repeatedResponse.body.error.code).toBe(BusinessErrorCode.LOAN_STATUS_NOT_ALLOWED);
  });
});

describe('processing returns and cancelling loans', () => {
  it('closes the loan and frees the copy', async () => {
    const loan = await createMemberLoan();

    await postLoanAction(loan.id, 'return-request', context.memberHeader);

    const response = await postLoanAction(loan.id, 'return', context.librarianHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data).toMatchObject({
      status: LoanStatus.RETURNED,
      copy: { status: CopyStatus.AVAILABLE },
    });
    expect(response.body.data.returnProcessedBy).not.toBeNull();
    expect(response.body.data.returnDate).not.toBeNull();
  });

  it('marks the copy damaged when it comes back damaged, audited on the copy', async () => {
    const loan = await createMemberLoan();

    const response = await postLoanAction(loan.id, 'return', context.adminHeader, {
      copyCondition: CopyStatus.DAMAGED,
    });

    expect(response.body.data.copy.status).toBe(CopyStatus.DAMAGED);

    const copyAuditEntries = await findAuditLogEntriesForRecord(loan.copy.id);

    expect(copyAuditEntries.map((entry) => entry.actionType)).toEqual([
      ActionType.BOOK_COPY_MARKED_DAMAGED,
    ]);
  });

  it('rejects an invalid copy condition and a second return', async () => {
    const loan = await createMemberLoan();

    const invalidResponse = await postLoanAction(loan.id, 'return', context.librarianHeader, {
      copyCondition: CopyStatus.ON_LOAN,
    });

    expect(invalidResponse.status).toBe(StatusCodes.BAD_REQUEST);

    await postLoanAction(loan.id, 'return', context.librarianHeader);

    const secondResponse = await postLoanAction(loan.id, 'return', context.librarianHeader);

    expect(secondResponse.status).toBe(StatusCodes.CONFLICT);
    expect(secondResponse.body.error.code).toBe(BusinessErrorCode.LOAN_STATUS_NOT_ALLOWED);
  });

  it('cancels a loan and puts the copy back on the shelf', async () => {
    const loan = await createMemberLoan();

    const response = await postLoanAction(loan.id, 'cancel', context.librarianHeader);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.status).toBe(LoanStatus.CANCELLED);
    expect((await findCopyById(loan.copy.id))?.status).toBe(CopyStatus.AVAILABLE);
  });

  it('is only allowed for staff', async () => {
    const loan = await createMemberLoan();

    expect((await postLoanAction(loan.id, 'return', context.memberHeader)).status).toBe(
      StatusCodes.FORBIDDEN,
    );

    expect((await postLoanAction(loan.id, 'cancel', context.viewerHeader)).status).toBe(
      StatusCodes.FORBIDDEN,
    );
  });
});

describe('marking overdue loans', () => {
  it('turns active loans past their due date into overdue loans, audited', async () => {
    const lateLoan = await createMemberLoan();
    const onTimeLoan = await createLoan({
      memberId: context.otherMemberId,
      bookId: context.bookId,
    });

    await setTestLoanDueDate(lateLoan.id, YESTERDAY);

    const markedLoansCount = await loanService.markOverdueLoans();

    expect(markedLoansCount).toBe(1);
    expect((await findLoanById(lateLoan.id))?.status).toBe(LoanStatus.OVERDUE);
    expect((await findLoanById(onTimeLoan.body.data.id))?.status).toBe(LoanStatus.ACTIVE);

    const auditEntries = await findAuditLogEntriesForRecord(lateLoan.id);

    expect(auditEntries.at(-1)?.actionType).toBe(ActionType.LOAN_MARKED_OVERDUE);
  });
});
