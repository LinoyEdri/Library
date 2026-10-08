import { describe, expect, it } from 'vitest';
import type { AuditLogWithActor } from '../../types/database/audit-log-with-actor.types.ts';
import type { AuditReferencedRecords } from '../../types/database/audit-referenced-records.types.ts';
import { buildAuditReferenceNames } from '../../utils/audit/build-audit-reference-names.ts';
import { collectAuditReferenceIds } from '../../utils/audit/collect-audit-reference-ids.ts';

const BOOK_ID = '0198a3f2-0000-7000-8000-000000000001';
const AUTHOR_ID = '0198a3f2-0000-7000-8000-000000000002';
const CATEGORY_ID = '0198a3f2-0000-7000-8000-000000000003';

describe('collectAuditReferenceIds', () => {
  it('finds the changed record and every uuid inside the values, once each', () => {
    const entry = {
      affectedRecordId: BOOK_ID,
      previousValue: { authorIds: [AUTHOR_ID], title: 'not an id' },
      newValue: { authorIds: [AUTHOR_ID], categoryIds: [CATEGORY_ID] },
      additionalContext: { source: 'SYSTEM_JOB' },
    } as unknown as AuditLogWithActor;

    expect(collectAuditReferenceIds([entry]).sort()).toEqual(
      [BOOK_ID, AUTHOR_ID, CATEGORY_ID].sort(),
    );
  });
});

describe('buildAuditReferenceNames', () => {
  it('names each kind of record', () => {
    const noRecords: AuditReferencedRecords = {
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

    expect(
      buildAuditReferenceNames({
        ...noRecords,
        books: [{ id: BOOK_ID, title: 'הנסיך הקטן' }],
        authors: [{ id: AUTHOR_ID, firstName: 'עמוס', lastName: 'עוז' }],
        categories: [{ id: CATEGORY_ID, name: 'ספרות' }],
      }),
    ).toEqual({
      [BOOK_ID]: 'הנסיך הקטן',
      [AUTHOR_ID]: 'עמוס עוז',
      [CATEGORY_ID]: 'ספרות',
    });
  });
});
