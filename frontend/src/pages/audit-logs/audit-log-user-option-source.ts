import type { ReferenceOptionSource } from '../../components/catalog-reference/reference-option.types';
import { QueryKeys } from '../../constants/query-keys';
import { usersApi } from '../../services/users.api';

const OPTIONS_PAGE_SIZE = 20;

// "Who acted" picker: any account, active or disabled
export const auditLogUserOptionSource: ReferenceOptionSource = {
  queryKey: [...QueryKeys.USERS, 'audit-log-options'],
  loadOptions: async (searchText) => {
    const { items } = await usersApi.list({
      page: 1,
      pageSize: OPTIONS_PAGE_SIZE,
      search: searchText || undefined,
    });

    return items.map((user) => ({
      id: user.id,
      label: `${user.firstName} ${user.lastName} · ${user.email}`,
    }));
  },
};
