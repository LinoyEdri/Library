import { RecordStatus } from '@library/shared';
import type { ReferenceOptionSource } from '../catalog-reference/reference-option.types';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { QueryKeys } from '../../constants/query-keys';
import { booksApi } from '../../services/books.api';
import { membersApi } from '../../services/members.api';

const OPTIONS_PAGE_SIZE = 20;

// Member picker: only active members (new loan), or every member (list filter)
export const buildMemberOptionSource = (onlyActive: boolean): ReferenceOptionSource => ({
  queryKey: [...QueryKeys.MEMBERS, 'options', String(onlyActive)],
  loadOptions: async (searchText) => {
    const { items } = await membersApi.list({
      page: 1,
      pageSize: OPTIONS_PAGE_SIZE,
      search: searchText || undefined,
      status: onlyActive ? RecordStatus.ACTIVE : undefined,
    });

    return items.map((member) => ({
      id: member.id,
      label: `${member.firstName} ${member.lastName} · ${member.email}`,
    }));
  },
});

// Book picker: only active books with their free copies (new loan), or every book (list filter)
export const buildBookOptionSource = (onlyActive: boolean): ReferenceOptionSource => ({
  queryKey: [...QueryKeys.BOOKS, 'options', String(onlyActive)],
  loadOptions: async (searchText) => {
    const { items } = await booksApi.list({
      page: 1,
      pageSize: OPTIONS_PAGE_SIZE,
      search: searchText || undefined,
      status: onlyActive ? RecordStatus.ACTIVE : undefined,
      sortBy: 'title',
      sortOrder: 'asc',
    });

    return items.map((book) => ({
      id: book.id,
      label: onlyActive
        ? `${book.title} · ${HebrewTexts.loans.availableCopiesLabel(book.availableCopies)}`
        : book.title,
    }));
  },
});

export const activeMemberOptionSource = buildMemberOptionSource(true);

export const anyMemberOptionSource = buildMemberOptionSource(false);

export const activeBookOptionSource = buildBookOptionSource(true);

export const anyBookOptionSource = buildBookOptionSource(false);
