import type { ReactNode } from 'react';
import { AuthenticationContext } from './authentication-context';
import { useAuthenticationProviderValue } from './hooks/useAuthenticationProviderValue';

// Makes the logged-in user and login/logout available to the whole app
export function AuthenticationProvider({ children }: { children: ReactNode }) {
  const authenticationValue = useAuthenticationProviderValue();

  return (
    <AuthenticationContext.Provider value={authenticationValue}>
      {children}
    </AuthenticationContext.Provider>
  );
}
