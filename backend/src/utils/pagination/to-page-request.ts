import type { PageRequest } from '../../types/database/page-request.types.ts';

// Page 1 with size 20 -> skip 0, take 20; page 2 -> skip 20, take 20
export const toPageRequest = (page: number, pageSize: number): PageRequest => ({
  skip: (page - 1) * pageSize,
  take: pageSize,
});
