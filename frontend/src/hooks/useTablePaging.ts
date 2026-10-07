import { useState } from 'react';

const DEFAULT_PAGE_SIZE = 20;

// Page index (0-based, as MUI tables count) and page size; a new page size starts from page one
export const useTablePaging = (initialPageSize = DEFAULT_PAGE_SIZE) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  return {
    pageIndex,
    setPageIndex,
    pageSize,
    changePageSize,
    resetToFirstPage: () => setPageIndex(0),
  };
};
