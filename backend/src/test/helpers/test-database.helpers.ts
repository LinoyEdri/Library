import { RecordStatus, Role } from '@prisma/client';
import prisma from '../../prisma/prisma.ts';
import { bcryptPassword } from '../../utils/password-hash.ts';
import { INTEGRATION_TEST_DATABASE_NAME } from '../setup/integration-test-database-name.ts';

// Every table, so a single TRUNCATE empties the whole database
const ALL_TABLE_NAMES = [
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

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quotedTableNames} CASCADE`);
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
