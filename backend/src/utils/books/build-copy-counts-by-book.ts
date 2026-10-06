import { CopyStatus } from '@prisma/client';
import type { CopyCounts } from '../../types/database/copy-counts.types.ts';

type CopyCountRow = {
  bookId: string;
  status: CopyStatus;
  copyCount: number;
};

// Copies that are part of the lending stock (damaged, lost and disabled copies are not)
const CIRCULATING_COPY_STATUSES: CopyStatus[] = [CopyStatus.AVAILABLE, CopyStatus.ON_LOAN];

export const EMPTY_COPY_COUNTS: CopyCounts = { availableCopies: 0, totalCopies: 0 };

// Turns "copies per book per status" rows into available/total counts per book id
export const buildCopyCountsByBook = (rows: CopyCountRow[]): Map<string, CopyCounts> => {
  const countsByBook = new Map<string, CopyCounts>();

  for (const row of rows) {
    const counts = countsByBook.get(row.bookId) ?? { ...EMPTY_COPY_COUNTS };

    if (row.status === CopyStatus.AVAILABLE) {
      counts.availableCopies += row.copyCount;
    }

    if (CIRCULATING_COPY_STATUSES.includes(row.status)) {
      counts.totalCopies += row.copyCount;
    }

    countsByBook.set(row.bookId, counts);
  }

  return countsByBook;
};
