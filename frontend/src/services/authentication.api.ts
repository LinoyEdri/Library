import type { LoginInput, LoginResponse, RegisterInput, SafeUserResponse } from '@library/shared';
import { sendApiRequest } from './api-client';

// Calls to the /auth endpoints
export const authenticationApi = {
  login: (credentials: LoginInput) =>
    sendApiRequest<LoginResponse>({ method: 'POST', url: '/auth/login', data: credentials }),

  register: (registration: RegisterInput) =>
    sendApiRequest<SafeUserResponse>({ method: 'POST', url: '/auth/register', data: registration }),

  getCurrentUser: () => sendApiRequest<SafeUserResponse>({ method: 'GET', url: '/auth/me' }),
};
