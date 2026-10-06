// Paging information sent in `meta` of every list response
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// One page of a list: the items plus the paging info
export interface PaginatedList<Item> {
  items: Item[];
  meta: PaginationMeta;
}
