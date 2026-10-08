import { createContext } from 'react';
import type { LoginInput, SafeUserResponse } from '@library/shared';

export interface AuthenticationContextValue {
  currentUser: SafeUserResponse | null;
  isLoadingCurrentUser: boolean;
  login: (credentials: LoginInput) => Promise<SafeUserResponse>;
  logout: () => Promise<void>;
  // Forgets the session on this device without calling the server (e.g. after handing over the admin role)
  endSessionLocally: () => void;
  // The saved session could not be checked because the server is unreachable
  isServerUnavailable: boolean;
  isRetryingCurrentUser: boolean;
  retryLoadingCurrentUser: () => void;
}

// Logged-in user and login/logout actions, provided by AuthenticationProvider
export const AuthenticationContext = createContext<AuthenticationContextValue | null>(null);
