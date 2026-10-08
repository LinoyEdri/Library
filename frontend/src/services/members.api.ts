import type {
  CreateMemberInput,
  MemberCandidateResponse,
  MemberDetailsInput,
  MemberResponse,
  RecordStatus,
} from '@library/shared';
import { sendApiRequest, sendPaginatedApiRequest } from './api-client';

// Query string of GET /members
export interface MemberListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: RecordStatus;
  sortBy?: 'lastName' | 'firstName' | 'registrationDate';
  sortOrder?: 'asc' | 'desc';
}

// Calls to /members
export const membersApi = {
  list: (params: MemberListParams) =>
    sendPaginatedApiRequest<MemberResponse>({ method: 'GET', url: '/members', params }),

  listCandidates: (search?: string) =>
    sendApiRequest<MemberCandidateResponse[]>({
      method: 'GET',
      url: '/members/candidates',
      params: { search: search || undefined },
    }),

  getMember: (memberId: string) =>
    sendApiRequest<MemberResponse>({ method: 'GET', url: `/members/${memberId}` }),

  create: (member: CreateMemberInput) =>
    sendApiRequest<MemberResponse>({ method: 'POST', url: '/members', data: member }),

  update: (memberId: string, details: MemberDetailsInput) =>
    sendApiRequest<MemberResponse>({
      method: 'PATCH',
      url: `/members/${memberId}`,
      data: details,
    }),

  disable: (memberId: string) =>
    sendApiRequest<MemberResponse>({ method: 'POST', url: `/members/${memberId}/disable` }),

  reactivate: (memberId: string) =>
    sendApiRequest<MemberResponse>({ method: 'POST', url: `/members/${memberId}/reactivate` }),
};
