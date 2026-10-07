import type {
  CreateUserInput,
  ManagedUserResponse,
  RecordStatus,
  Role,
  UpdateUserInput,
} from '@library/shared';
import { sendApiRequest, sendPaginatedApiRequest } from './api-client';

// Query string of GET /users
export interface UserListParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: Role;
  status?: RecordStatus;
  sortBy?: 'lastName' | 'firstName' | 'createdDate' | 'lastLoginDate';
  sortOrder?: 'asc' | 'desc';
}

// Calls to the admin /users endpoints
export const usersApi = {
  list: (params: UserListParams) =>
    sendPaginatedApiRequest<ManagedUserResponse>({ method: 'GET', url: '/users', params }),

  getUser: (userId: string) =>
    sendApiRequest<ManagedUserResponse>({ method: 'GET', url: `/users/${userId}` }),

  create: (user: CreateUserInput) =>
    sendApiRequest<ManagedUserResponse>({ method: 'POST', url: '/users', data: user }),

  update: (userId: string, details: UpdateUserInput) =>
    sendApiRequest<ManagedUserResponse>({
      method: 'PATCH',
      url: `/users/${userId}`,
      data: details,
    }),

  changeRole: (userId: string, role: Role) =>
    sendApiRequest<ManagedUserResponse>({
      method: 'PATCH',
      url: `/users/${userId}/role`,
      data: { role },
    }),

  disable: (userId: string) =>
    sendApiRequest<ManagedUserResponse>({ method: 'POST', url: `/users/${userId}/disable` }),

  reactivate: (userId: string) =>
    sendApiRequest<ManagedUserResponse>({ method: 'POST', url: `/users/${userId}/reactivate` }),
};
