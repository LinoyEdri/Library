import { describe, expect, it } from 'vitest';
import { RecordStatus } from '@prisma/client';
import { buildPaginationMeta } from '../../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../../utils/pagination/to-page-request.ts';
import { resolveVisibleRecordStatus } from '../../utils/authorization/resolve-visible-record-status.ts';

describe('toPageRequest', () => {
  it('turns page and page size into skip and take', () => {
    expect(toPageRequest(1, 20)).toEqual({ skip: 0, take: 20 });
    expect(toPageRequest(3, 10)).toEqual({ skip: 20, take: 10 });
  });
});

describe('buildPaginationMeta', () => {
  it('rounds the number of pages up', () => {
    expect(buildPaginationMeta(1, 20, 41).totalPages).toBe(3);
  });

  it('reports one page for an empty list', () => {
    expect(buildPaginationMeta(1, 20, 0).totalPages).toBe(1);
  });
});

describe('resolveVisibleRecordStatus', () => {
  it('lets managers use any status filter, or none', () => {
    expect(resolveVisibleRecordStatus(RecordStatus.DISABLED, true)).toBe(RecordStatus.DISABLED);
    expect(resolveVisibleRecordStatus(undefined, true)).toBeUndefined();
  });

  it('always limits everyone else to active records', () => {
    expect(resolveVisibleRecordStatus(RecordStatus.DISABLED, false)).toBe(RecordStatus.ACTIVE);
    expect(resolveVisibleRecordStatus(undefined, false)).toBe(RecordStatus.ACTIVE);
  });
});
