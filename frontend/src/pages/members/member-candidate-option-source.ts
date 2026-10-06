import type { ReferenceOptionSource } from '../../components/catalog-reference/reference-option.types';
import { QueryKeys } from '../../constants/query-keys';
import { membersApi } from '../../services/members.api';

// Picker choices for "link existing user": active guest accounts that are not members yet
export const memberCandidateOptionSource: ReferenceOptionSource = {
  queryKey: QueryKeys.MEMBER_CANDIDATES,
  loadOptions: async (searchText) => {
    const candidates = await membersApi.listCandidates(searchText);

    return candidates.map((candidate) => ({
      id: candidate.userId,
      label: `${candidate.firstName} ${candidate.lastName} · ${candidate.email}`,
    }));
  },
};
