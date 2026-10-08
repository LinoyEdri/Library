import type { PaginationMeta } from '@library/shared';

// One page of a list endpoint: the items go in `data`, the paging info in `meta`
export interface PaginatedResult<Item> {
  items: Item[];
  meta: PaginationMeta;
}
