import {
  ActionType,
  CopyStatus,
  EntityType,
  RecordStatus,
  Role,
  type Prisma,
} from '@prisma/client';
import prisma from '../../prisma/prisma.ts';
import { bcryptPassword } from '../../utils/authentication/password-hash.ts';
import { INTEGRATION_TEST_DATABASE_NAME } from '../setup/integration-test-database-name.ts';

// Every table, so a single TRUNCATE empties the whole database
const ALL_TABLE_NAMES = [
  'SystemSetting',
  'AuditLog',
  'Loan',
  'BookCopy',
  'BookCategory',
  'BookAuthor',
  'Book',
  'Category',
  'Publisher',
  'Author',
  'Member',
  'User',
  'Address',
];

// Plain-text password of every user created by createTestUser
export const TEST_USER_PASSWORD = 'TestPassword123';

let testUserPasswordHash: string | undefined;

let createdTestUserCounter = 0;

type CreateTestUserOptions = {
  role?: Role;
  status?: RecordStatus;
  email?: string;
};

// Empties every table. Refuses to run against anything but the test database.
export const clearIntegrationTestDatabase = async (): Promise<void> => {
  const [{ current_database: connectedDatabaseName }] = await prisma.$queryRaw<
    { current_database: string }[]
  >`SELECT current_database()`;

  if (connectedDatabaseName !== INTEGRATION_TEST_DATABASE_NAME) {
    throw new Error(
      `Refusing to clear "${connectedDatabaseName}" - not the integration test database`,
    );
  }

  const quotedTableNames = ALL_TABLE_NAMES.map((tableName) => `"${tableName}"`).join(', ');

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quotedTableNames} RESTART IDENTITY CASCADE`);
};

// Creates a user (with address, and a member row for MEMBER users) that can log in with TEST_USER_PASSWORD
export const createTestUser = async ({
  role = Role.VIEWER,
  status = RecordStatus.ACTIVE,
  email,
}: CreateTestUserOptions = {}) => {
  testUserPasswordHash ??= await bcryptPassword.hashPassword(TEST_USER_PASSWORD);

  createdTestUserCounter += 1;

  return prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: email ?? `test-user-${createdTestUserCounter}-${Date.now()}@example.com`,
      passwordHash: testUserPasswordHash,
      phoneNumber: '0501234567',
      role,
      status,
      address: {
        create: { street: 'Herzl', houseNumber: '1', apartmentOrUnit: '1', city: 'Tel Aviv' },
      },
      member: role === Role.MEMBER ? { create: {} } : undefined,
    },
    include: { address: true, member: true },
  });
};

export const findAuditLogEntriesForRecord = (affectedRecordId: string) =>
  prisma.auditLog.findMany({
    where: { affectedRecordId },
    orderBy: { createdDate: 'asc' },
  });

export const findUserById = (userId: string) => prisma.user.findUnique({ where: { id: userId } });

export const updateTestUser = (userId: string, data: { role?: Role; status?: RecordStatus }) =>
  prisma.user.update({ where: { id: userId }, data });

export const disconnectIntegrationTestDatabase = () => prisma.$disconnect();

let createdCatalogRecordCounter = 0;

// A publisher, author and category (active unless stated) for building test books
export const createTestCatalogReferences = async (
  createdByUserId: string,
  status: RecordStatus = RecordStatus.ACTIVE,
) => {
  createdCatalogRecordCounter += 1;

  const uniqueSuffix = `${createdCatalogRecordCounter}-${Date.now()}`;

  const [publisher, author, category] = await Promise.all([
    prisma.publisher.create({ data: { name: `הוצאה ${uniqueSuffix}`, status, createdByUserId } }),
    prisma.author.create({
      data: {
        firstName: 'עמוס',
        lastName: `עוז${createdCatalogRecordCounter}`,
        status,
        createdByUserId,
      },
    }),
    prisma.category.create({ data: { name: `קטגוריה ${uniqueSuffix}`, status, createdByUserId } }),
  ]);

  return { publisher, author, category };
};

// Puts a copy on loan directly (the loans workflow arrives in a later slice)
export const setTestCopyStatus = (copyId: string, status: CopyStatus) =>
  prisma.bookCopy.update({ where: { id: copyId }, data: { status } });

let createdTestBookCounter = 0;

// An active book (with its catalog references) and the given number of available copies
export const createTestBookWithCopies = async (createdByUserId: string, copyCount = 1) => {
  const { publisher } = await createTestCatalogReferences(createdByUserId);

  createdTestBookCounter += 1;

  const book = await prisma.book.create({
    data: {
      title: `ספר בדיקה ${createdTestBookCounter}`,
      language: 'עברית',
      imageUrl: '',
      publisherId: publisher.id,
      createdByUserId,
    },
  });

  const copies = [];

  for (let copyIndex = 1; copyIndex <= copyCount; copyIndex += 1) {
    copies.push(
      await prisma.bookCopy.create({
        data: {
          bookId: book.id,
          barcode: `TEST-${createdTestBookCounter}-${copyIndex}-${Date.now()}`,
          createdByUserId,
        },
      }),
    );
  }

  return { book, copies };
};

export const findCopyById = (copyId: string) =>
  prisma.bookCopy.findUnique({ where: { id: copyId } });

export const findLoanById = (loanId: string) => prisma.loan.findUnique({ where: { id: loanId } });

// Moves a loan's due date (e.g. into the past, to test overdue handling)
export const setTestLoanDueDate = (loanId: string, dueDate: Date) =>
  prisma.loan.update({ where: { id: loanId }, data: { dueDate } });

export const setTestMemberStatus = (memberId: string, status: RecordStatus) =>
  prisma.member.update({ where: { id: memberId }, data: { status } });

export const setTestBookStatus = (bookId: string, status: RecordStatus) =>
  prisma.book.update({ where: { id: bookId }, data: { status } });

type CreateTestAuditLogEntryOptions = {
  actionType?: ActionType;
  affectedType?: EntityType;
  affectedRecordId?: string;
  createdDate?: Date;
  newValue?: Prisma.InputJsonValue;
};

// Writes an audit entry directly (for audit log list and filter tests)
export const createTestAuditLogEntry = (
  actionUser: { id: string; role: Role },
  {
    actionType = ActionType.BOOK_UPDATED,
    affectedType = EntityType.BOOK,
    affectedRecordId,
    createdDate,
    newValue = { title: 'אחרי' },
  }: CreateTestAuditLogEntryOptions = {},
) =>
  prisma.auditLog.create({
    data: {
      actionType,
      affectedType,
      affectedRecordId,
      createdDate,
      actionUserId: actionUser.id,
      actionUserRole: actionUser.role,
      previousValue: { title: 'לפני' },
      newValue,
    },
  });
