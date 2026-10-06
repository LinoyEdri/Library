import { describe, expect, it } from 'vitest';
import { ActionType, CopyStatus, RecordStatus } from '@prisma/client';
import { isValidIsbn, normalizeIsbn } from '@library/shared';
import { buildCopyCountsByBook } from '../../utils/books/build-copy-counts-by-book.ts';
import { buildCopyStatusChange } from '../../utils/books/build-copy-status-change.ts';
import { findUnusableReferenceIds } from '../../utils/books/find-unusable-reference-ids.ts';

describe('ISBN validation', () => {
  it('accepts valid ISBN-10 and ISBN-13, with or without hyphens', () => {
    expect(isValidIsbn(normalizeIsbn('978-965-00-0001-1'))).toBe(true);
    expect(isValidIsbn('0306406152')).toBe(true);
    expect(isValidIsbn('080442957X')).toBe(true);
  });

  it('rejects wrong check digits and wrong lengths', () => {
    expect(isValidIsbn('9789650000012')).toBe(false);
    expect(isValidIsbn('12345')).toBe(false);
  });
});

describe('buildCopyCountsByBook', () => {
  it('counts available copies and copies in circulation per book', () => {
    const countsByBook = buildCopyCountsByBook([
      { bookId: 'book-1', status: CopyStatus.AVAILABLE, copyCount: 2 },
      { bookId: 'book-1', status: CopyStatus.ON_LOAN, copyCount: 1 },
      { bookId: 'book-1', status: CopyStatus.LOST, copyCount: 3 },
      { bookId: 'book-2', status: CopyStatus.DAMAGED, copyCount: 1 },
    ]);

    expect(countsByBook.get('book-1')).toEqual({ availableCopies: 2, totalCopies: 3 });
    expect(countsByBook.get('book-2')).toEqual({ availableCopies: 0, totalCopies: 0 });
  });
});

describe('buildCopyStatusChange', () => {
  it('records who disabled the copy and audits BOOK_COPY_DISABLED', () => {
    const change = buildCopyStatusChange(CopyStatus.DISABLED, 'user-1');

    expect(change.data.disabledByUserId).toBe('user-1');
    expect(change.data.disabledDate).toBeInstanceOf(Date);
    expect(change.auditActionType).toBe(ActionType.BOOK_COPY_DISABLED);
  });

  it('clears the disable details when the copy becomes available again', () => {
    const change = buildCopyStatusChange(CopyStatus.AVAILABLE, 'user-1');

    expect(change.data).toEqual({
      status: CopyStatus.AVAILABLE,
      disabledDate: null,
      disabledByUserId: null,
    });
    expect(change.auditActionType).toBe(ActionType.BOOK_COPY_REACTIVATED);
  });
});

describe('findUnusableReferenceIds', () => {
  const foundRecords = [
    { id: 'active', status: RecordStatus.ACTIVE },
    { id: 'disabled', status: RecordStatus.DISABLED },
  ];

  it('flags missing ids and newly linked disabled records', () => {
    expect(
      findUnusableReferenceIds(['active', 'disabled', 'missing'], foundRecords, new Set()),
    ).toEqual(['disabled', 'missing']);
  });

  it('allows a disabled record the book was already linked to', () => {
    expect(
      findUnusableReferenceIds(['active', 'disabled'], foundRecords, new Set(['disabled'])),
    ).toEqual([]);
  });
});
