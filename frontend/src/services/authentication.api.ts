import type {
  ChangeOwnPasswordInput,
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  PasswordResetCodeSentResponse,
  PasswordResetCodeVerifiedResponse,
  RegisterInput,
  ResetPasswordInput,
  SafeUserResponse,
  VerifyPasswordResetCodeInput,
} from '@library/shared';
import { sendApiRequest } from './api-client';

// Calls to the /auth endpoints
export const authenticationApi = {
  login: (credentials: LoginInput) =>
    sendApiRequest<LoginResponse>({ method: 'POST', url: '/auth/login', data: credentials }),

  register: (registration: RegisterInput) =>
    sendApiRequest<SafeUserResponse>({ method: 'POST', url: '/auth/register', data: registration }),

  getCurrentUser: () => sendApiRequest<SafeUserResponse>({ method: 'GET', url: '/auth/me' }),

  changeOwnPassword: (passwords: ChangeOwnPasswordInput) =>
    sendApiRequest<null>({ method: 'POST', url: '/auth/change-password', data: passwords }),

  // Forgot password: send a code by email/SMS, verify it, then set the new password
  requestPasswordResetCode: (request: ForgotPasswordInput) =>
    sendApiRequest<PasswordResetCodeSentResponse>({
      method: 'POST',
      url: '/auth/forgot-password',
      data: request,
    }),

  verifyPasswordResetCode: (verification: VerifyPasswordResetCodeInput) =>
    sendApiRequest<PasswordResetCodeVerifiedResponse>({
      method: 'POST',
      url: '/auth/forgot-password/verify',
      data: verification,
    }),

  resetPassword: (reset: ResetPasswordInput) =>
    sendApiRequest<null>({ method: 'POST', url: '/auth/reset-password', data: reset }),

  logout: () => sendApiRequest<null>({ method: 'POST', url: '/auth/logout' }),
};
