import prisma from '../prisma/prisma.ts';
import {
  auditReferencedRecordSelects as selects,
  type AuditReferencedRecords,
} from '../types/database/audit-referenced-records.types.ts';
import { InternalError } from '../types/errors/InternalError.ts';

const NO_REFERENCED_RECORDS: AuditReferencedRecords = {
  users: [],
  members: [],
  addresses: [],
  books: [],
  bookCopies: [],
  authors: [],
  publishers: [],
  categories: [],
  loans: [],
  systemSettings: [],
};

// Looks the ids up in every table an audit entry can point at (ids are unique across tables)
export const auditReferencedRecordRepository = {
  async findByIds(ids: string[]): Promise<AuditReferencedRecords> {
    if (ids.length === 0) {
      return NO_REFERENCED_RECORDS;
    }

    const byIds = { where: { id: { in: ids } } };

    try {
      const [
        users,
        members,
        addresses,
        books,
        bookCopies,
        authors,
        publishers,
        categories,
        loans,
        systemSettings,
      ] = await prisma.$transaction([
        prisma.user.findMany({ ...byIds, select: selects.user }),
        prisma.member.findMany({ ...byIds, select: selects.member }),
        prisma.address.findMany({ ...byIds, select: selects.address }),
        prisma.book.findMany({ ...byIds, select: selects.book }),
        prisma.bookCopy.findMany({ ...byIds, select: selects.bookCopy }),
        prisma.author.findMany({ ...byIds, select: selects.author }),
        prisma.publisher.findMany({ ...byIds, select: selects.publisher }),
        prisma.category.findMany({ ...byIds, select: selects.category }),
        prisma.loan.findMany({ ...byIds, select: selects.loan }),
        prisma.systemSetting.findMany({ ...byIds, select: selects.systemSetting }),
      ]);

      return {
        users,
        members,
        addresses,
        books,
        bookCopies,
        authors,
        publishers,
        categories,
        loans,
        systemSettings,
      };
    } catch {
      throw new InternalError('Failed to load the records named in the audit log');
    }
  },
};
