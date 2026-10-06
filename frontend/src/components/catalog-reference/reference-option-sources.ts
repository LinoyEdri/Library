import { RecordStatus } from '@library/shared';
import { QueryKeys } from '../../constants/query-keys';
import { authorsApi, categoriesApi, publishersApi } from '../../services/catalog-reference.api';
import type { ReferenceOptionSource } from './reference-option.types';

// How many matches a picker shows at once (typing narrows the list)
const OPTIONS_PAGE_SIZE = 20;

// Only active records can be picked
const activeRecordsQuery = (searchText?: string) => ({
  page: 1,
  pageSize: OPTIONS_PAGE_SIZE,
  search: searchText || undefined,
  status: RecordStatus.ACTIVE,
});

export const authorOptionSource: ReferenceOptionSource = {
  queryKey: [...QueryKeys.AUTHORS, 'options'],
  loadOptions: async (searchText) => {
    const { items } = await authorsApi.list(activeRecordsQuery(searchText));

    return items.map((author) => ({
      id: author.id,
      label: `${author.firstName} ${author.lastName}`,
    }));
  },
};

export const categoryOptionSource: ReferenceOptionSource = {
  queryKey: [...QueryKeys.CATEGORIES, 'options'],
  loadOptions: async (searchText) => {
    const { items } = await categoriesApi.list(activeRecordsQuery(searchText));

    return items.map((category) => ({ id: category.id, label: category.name }));
  },
};

export const publisherOptionSource: ReferenceOptionSource = {
  queryKey: [...QueryKeys.PUBLISHERS, 'options'],
  loadOptions: async (searchText) => {
    const { items } = await publishersApi.list(activeRecordsQuery(searchText));

    return items.map((publisher) => ({ id: publisher.id, label: publisher.name }));
  },
};
