import { createContext } from 'react';
import type { LoginInput, SafeUserResponse } from '@library/shared';

export interface AuthenticationContextValue {
  currentUser: SafeUserResponse | null;
  isLoadingCurrentUser: boolean;
  login: (credentials: LoginInput) => Promise<SafeUserResponse>;
  logout: () => Promise<void>;
}

// Logged-in user and login/logout actions, provided by AuthenticationProvider
export const AuthenticationContext = createContext<AuthenticationContextValue | null>(null);
