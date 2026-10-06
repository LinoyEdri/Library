import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Permission, type RecordStatus } from '@library/shared';
import type { ReferenceOption } from '../../../components/catalog-reference/reference-option.types';
import { QueryKeys } from '../../../constants/query-keys';
import { useCan } from '../../../hooks/useCan';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { booksApi, type BookListParams } from '../../../services/books.api';

const BOOKS_PER_PAGE = 12;

// Sort choices shown to the user, and how each maps to the API
export const BOOK_SORT_OPTIONS = {
  title: { sortBy: 'title', sortOrder: 'asc' },
  newest: { sortBy: 'publicationYear', sortOrder: 'desc' },
  recentlyAdded: { sortBy: 'createdDate', sortOrder: 'desc' },
} as const satisfies Record<string, Pick<BookListParams, 'sortBy' | 'sortOrder'>>;

export type BookSortOption = keyof typeof BOOK_SORT_OPTIONS;

export type AvailabilityFilter = '' | 'available' | 'unavailable';

// Catalog state: search, filters, sort and page, plus the books and languages queries
export const useBooksCatalog = () => {
  const canCreateBooks = useCan(Permission.BOOKS_CREATE);

  const canSeeDisabledBooks = useCan(Permission.BOOKS_UPDATE);

  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReferenceOption | null>(null);
  const [authorFilter, setAuthorFilter] = useState<ReferenceOption | null>(null);
  const [publisherFilter, setPublisherFilter] = useState<ReferenceOption | null>(null);
  const [languageFilter, setLanguageFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('');
  const [statusFilter, setStatusFilter] = useState<RecordStatus | ''>('');
  const [sortOption, setSortOption] = useState<BookSortOption>('title');
  const [page, setPage] = useState(1);

  const debouncedSearchText = useDebouncedValue(searchText.trim());

  const listParams: BookListParams = {
    page,
    pageSize: BOOKS_PER_PAGE,
    search: debouncedSearchText || undefined,
    categoryId: categoryFilter?.id,
    authorId: authorFilter?.id,
    publisherId: publisherFilter?.id,
    language: languageFilter || undefined,
    availability: availabilityFilter || undefined,
    status: statusFilter || undefined,
    ...BOOK_SORT_OPTIONS[sortOption],
  };

  const booksQuery = useQuery({
    queryKey: [...QueryKeys.BOOKS, listParams],
    queryFn: () => booksApi.list(listParams),
    placeholderData: keepPreviousData,
  });

  const languagesQuery = useQuery({
    queryKey: QueryKeys.BOOK_LANGUAGES,
    queryFn: booksApi.listLanguages,
  });

  // Every filter change goes back to the first page
  const withFirstPage =
    <Value>(setFilter: (value: Value) => void) =>
    (value: Value) => {
      setFilter(value);
      setPage(1);
    };

  const clearFilters = () => {
    setSearchText('');
    setCategoryFilter(null);
    setAuthorFilter(null);
    setPublisherFilter(null);
    setLanguageFilter('');
    setAvailabilityFilter('');
    setStatusFilter('');
    setPage(1);
  };

  return {
    canCreateBooks,
    canSeeDisabledBooks,
    books: booksQuery.data?.items ?? [],
    totalPages: booksQuery.data?.meta.totalPages ?? 1,
    isLoading: booksQuery.isFetching,
    languages: languagesQuery.data ?? [],
    searchText,
    changeSearchText: withFirstPage(setSearchText),
    categoryFilter,
    changeCategoryFilter: withFirstPage(setCategoryFilter),
    authorFilter,
    changeAuthorFilter: withFirstPage(setAuthorFilter),
    publisherFilter,
    changePublisherFilter: withFirstPage(setPublisherFilter),
    languageFilter,
    changeLanguageFilter: withFirstPage(setLanguageFilter),
    availabilityFilter,
    changeAvailabilityFilter: withFirstPage(setAvailabilityFilter),
    statusFilter,
    changeStatusFilter: withFirstPage(setStatusFilter),
    sortOption,
    changeSortOption: withFirstPage(setSortOption),
    page,
    setPage,
    clearFilters,
  };
};

export type BooksCatalogState = ReturnType<typeof useBooksCatalog>;
