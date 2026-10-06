import type { PaginationMeta } from '@library/shared';

// Paging info for the response `meta` (an empty list still has 1 page)
export const buildPaginationMeta = (
  page: number,
  pageSize: number,
  totalItems: number,
): PaginationMeta => ({
  page,
  pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
});
