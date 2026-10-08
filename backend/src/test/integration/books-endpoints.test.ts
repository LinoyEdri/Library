import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ActionType, CopyStatus, RecordStatus, Role } from '@prisma/client';
import { createApp } from '../../app.ts';
import {
  clearIntegrationTestDatabase,
  createTestCatalogReferences,
  createTestUser,
  disconnectIntegrationTestDatabase,
  findAuditLogEntriesForRecord,
  setTestCopyStatus,
} from '../helpers/test-database.helpers.ts';
import { authorizationHeaderFor } from '../helpers/test-authentication.helpers.ts';

const application = createApp();

// A valid ISBN-13 written with hyphens; it is stored without them
const VALID_ISBN_WITH_HYPHENS = '978-965-00-0001-1';
const VALID_ISBN = '9789650000011';

type TestContext = {
  adminHeader: string;
  librarianHeader: string;
  memberHeader: string;
  viewerHeader: string;
  references: Awaited<ReturnType<typeof createTestCatalogReferences>>;
};

let context: TestContext;

// Body for creating a book linked to the test publisher, author and category
const buildBookBody = (overrides: object = {}) => ({
  title: 'סיפור על אהבה וחושך',
  isbn: VALID_ISBN_WITH_HYPHENS,
  publisherId: context.references.publisher.id,
  authorIds: [context.references.author.id],
  categoryIds: [context.references.category.id],
  publicationYear: 2002,
  language: 'עברית',
  imageUrl: '',
  description: 'רומן אוטוביוגרפי',
  ...overrides,
});

// Creates a book as the librarian and returns its id
const createBookAsLibrarian = async (overrides: object = {}): Promise<string> => {
  const response = await request(application)
    .post('/api/books')
    .set('Authorization', context.librarianHeader)
    .send(buildBookBody(overrides));

  return response.body.data.id;
};

const addCopy = (bookId: string, barcode: string) =>
  request(application)
    .post(`/api/books/${bookId}/copies`)
    .set('Authorization', context.librarianHeader)
    .send({ barcode });

beforeEach(async () => {
  await clearIntegrationTestDatabase();

  const admin = await createTestUser({ role: Role.ADMIN });
  const librarian = await createTestUser({ role: Role.LIBRARIAN });
  const member = await createTestUser({ role: Role.MEMBER });
  const viewer = await createTestUser({ role: Role.VIEWER });

  context = {
    adminHeader: authorizationHeaderFor(admin),
    librarianHeader: authorizationHeaderFor(librarian),
    memberHeader: authorizationHeaderFor(member),
    viewerHeader: authorizationHeaderFor(viewer),
    references: await createTestCatalogReferences(admin.id),
  };
});

afterAll(async () => {
  await disconnectIntegrationTestDatabase();
});

describe('creating and updating books', () => {
  it('lets a librarian create a book; the ISBN is stored without hyphens and audited', async () => {
    const response = await request(application)
      .post('/api/books')
      .set('Authorization', context.librarianHeader)
      .send(buildBookBody());

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.data.isbn).toBe(VALID_ISBN);
    expect(response.body.data.authors[0]).toMatchObject({
      id: context.references.author.id,
      isPrimaryAuthor: true,
    });
    expect(response.body.data.categories).toHaveLength(1);

    const auditActions = (await findAuditLogEntriesForRecord(response.body.data.id)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toEqual([ActionType.BOOK_CREATED]);
  });

  it.each([
    ['member', 'memberHeader'],
    ['viewer', 'viewerHeader'],
  ] as const)('forbids a %s from creating books (403)', async (_roleName, headerKey) => {
    const response = await request(application)
      .post('/api/books')
      .set('Authorization', context[headerKey])
      .send(buildBookBody());

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('rejects an ISBN with a wrong check digit (400)', async () => {
    const response = await request(application)
      .post('/api/books')
      .set('Authorization', context.librarianHeader)
      .send(buildBookBody({ isbn: '9789650000012' }));

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error.details[0].field).toBe('isbn');
  });

  it('rejects a duplicate ISBN (409)', async () => {
    await createBookAsLibrarian();

    const response = await request(application)
      .post('/api/books')
      .set('Authorization', context.librarianHeader)
      .send(buildBookBody({ title: 'ספר אחר' }));

    expect(response.status).toBe(StatusCodes.CONFLICT);
  });

  it('rejects a disabled author on a new book (400)', async () => {
    const admin = await createTestUser({ role: Role.ADMIN });

    const disabledReferences = await createTestCatalogReferences(admin.id, RecordStatus.DISABLED);

    const response = await request(application)
      .post('/api/books')
      .set('Authorization', context.librarianHeader)
      .send(buildBookBody({ authorIds: [disabledReferences.author.id] }));

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('replaces authors and categories on update and audits the change', async () => {
    const bookId = await createBookAsLibrarian();

    const admin = await createTestUser({ role: Role.ADMIN });

    const otherReferences = await createTestCatalogReferences(admin.id);

    const response = await request(application)
      .patch(`/api/books/${bookId}`)
      .set('Authorization', context.librarianHeader)
      .send(
        buildBookBody({
          title: 'כותרת חדשה',
          authorIds: [otherReferences.author.id, context.references.author.id],
          categoryIds: [otherReferences.category.id],
        }),
      );

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.title).toBe('כותרת חדשה');
    expect(response.body.data.authors[0]).toMatchObject({
      id: otherReferences.author.id,
      isPrimaryAuthor: true,
    });
    expect(response.body.data.categories.map((category: { id: string }) => category.id)).toEqual([
      otherReferences.category.id,
    ]);

    const auditActions = (await findAuditLogEntriesForRecord(bookId)).map(
      (entry) => entry.actionType,
    );

    expect(auditActions).toEqual([ActionType.BOOK_CREATED, ActionType.BOOK_UPDATED]);
  });
});

describe('disabling books', () => {
  it('lets only admins disable; disabled books are hidden from non-staff', async () => {
    const bookId = await createBookAsLibrarian();

    const librarianDisableResponse = await request(application)
      .post(`/api/books/${bookId}/disable`)
      .set('Authorization', context.librarianHeader);

    expect(librarianDisableResponse.status).toBe(StatusCodes.FORBIDDEN);

    const adminDisableResponse = await request(application)
      .post(`/api/books/${bookId}/disable`)
      .set('Authorization', context.adminHeader);

    expect(adminDisableResponse.status).toBe(StatusCodes.OK);
    expect(adminDisableResponse.body.data.status).toBe(RecordStatus.DISABLED);

    const viewerGetResponse = await request(application)
      .get(`/api/books/${bookId}`)
      .set('Authorization', context.viewerHeader);

    const viewerListResponse = await request(application)
      .get('/api/books')
      .set('Authorization', context.viewerHeader);

    const librarianGetResponse = await request(application)
      .get(`/api/books/${bookId}`)
      .set('Authorization', context.librarianHeader);

    expect(viewerGetResponse.status).toBe(StatusCodes.NOT_FOUND);
    expect(viewerListResponse.body.data).toHaveLength(0);
    expect(librarianGetResponse.status).toBe(StatusCodes.OK);

    const reactivateResponse = await request(application)
      .post(`/api/books/${bookId}/reactivate`)
      .set('Authorization', context.adminHeader);

    expect(reactivateResponse.body.data.status).toBe(RecordStatus.ACTIVE);
  });
});

describe('copies and availability', () => {
  it('counts copies, shows copies only to staff and audits status changes', async () => {
    const bookId = await createBookAsLibrarian();

    const firstCopyResponse = await addCopy(bookId, 'TEST-0001');

    await addCopy(bookId, 'TEST-0002');

    expect(firstCopyResponse.status).toBe(StatusCodes.CREATED);
    expect(firstCopyResponse.body.data.status).toBe(CopyStatus.AVAILABLE);

    const staffResponse = await request(application)
      .get(`/api/books/${bookId}`)
      .set('Authorization', context.librarianHeader);

    const memberResponse = await request(application)
      .get(`/api/books/${bookId}`)
      .set('Authorization', context.memberHeader);

    expect(staffResponse.body.data.copies).toHaveLength(2);
    expect(memberResponse.body.data).not.toHaveProperty('copies');
    expect(memberResponse.body.data).toMatchObject({ availableCopies: 2, totalCopies: 2 });

    const lostCopyId = firstCopyResponse.body.data.id;

    const markLostResponse = await request(application)
      .patch(`/api/book-copies/${lostCopyId}/status`)
      .set('Authorization', context.librarianHeader)
      .send({ status: CopyStatus.LOST });

    expect(markLostResponse.status).toBe(StatusCodes.OK);

    const afterLossResponse = await request(application)
      .get(`/api/books/${bookId}`)
      .set('Authorization', context.memberHeader);

    expect(afterLossResponse.body.data).toMatchObject({ availableCopies: 1, totalCopies: 1 });

    const copyAuditActions = (await findAuditLogEntriesForRecord(lostCopyId)).map(
      (entry) => entry.actionType,
    );

    expect(copyAuditActions).toEqual([
      ActionType.BOOK_COPY_CREATED,
      ActionType.BOOK_COPY_MARKED_LOST,
    ]);
  });

  it('rejects a duplicate barcode (409)', async () => {
    const bookId = await createBookAsLibrarian();

    await addCopy(bookId, 'TEST-0001');

    const duplicateResponse = await addCopy(bookId, 'TEST-0001');

    expect(duplicateResponse.status).toBe(StatusCodes.CONFLICT);
  });

  it('refuses to change a copy that is on loan (409)', async () => {
    const bookId = await createBookAsLibrarian();

    const copyResponse = await addCopy(bookId, 'TEST-0001');

    await setTestCopyStatus(copyResponse.body.data.id, CopyStatus.ON_LOAN);

    const response = await request(application)
      .patch(`/api/book-copies/${copyResponse.body.data.id}/status`)
      .set('Authorization', context.librarianHeader)
      .send({ status: CopyStatus.DAMAGED });

    expect(response.status).toBe(StatusCodes.CONFLICT);
  });

  it('forbids members from adding copies (403)', async () => {
    const bookId = await createBookAsLibrarian();

    const response = await request(application)
      .post(`/api/books/${bookId}/copies`)
      .set('Authorization', context.memberHeader)
      .send({ barcode: 'TEST-0001' });

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });
});

describe('catalog search and filters', () => {
  it('finds books by author name, filters by category and availability, and lists languages', async () => {
    const availableBookId = await createBookAsLibrarian();

    await addCopy(availableBookId, 'TEST-0001');

    await createBookAsLibrarian({
      title: 'ספר בלי עותקים',
      isbn: null,
      categoryIds: [],
      language: 'אנגלית',
    });

    const searchResponse = await request(application)
      .get(`/api/books?search=${encodeURIComponent(context.references.author.lastName)}`)
      .set('Authorization', context.memberHeader);

    const categoryResponse = await request(application)
      .get(`/api/books?categoryId=${context.references.category.id}`)
      .set('Authorization', context.memberHeader);

    const availableResponse = await request(application)
      .get('/api/books?availability=available')
      .set('Authorization', context.memberHeader);

    const unavailableResponse = await request(application)
      .get('/api/books?availability=unavailable')
      .set('Authorization', context.memberHeader);

    const languagesResponse = await request(application)
      .get('/api/books/languages')
      .set('Authorization', context.viewerHeader);

    expect(searchResponse.body.data).toHaveLength(2);
    expect(categoryResponse.body.data.map((book: { id: string }) => book.id)).toEqual([
      availableBookId,
    ]);
    expect(availableResponse.body.data.map((book: { id: string }) => book.id)).toEqual([
      availableBookId,
    ]);
    expect(unavailableResponse.body.data).toHaveLength(1);
    expect(languagesResponse.body.data).toEqual(['אנגלית', 'עברית']);
  });
});
