import { useContext } from 'react';
import { AuthenticationContext } from '../context/authentication-context';

// Current user plus login/logout. Must be used inside AuthenticationProvider.
export const useAuthentication = () => {
  const authenticationContext = useContext(AuthenticationContext);

  if (!authenticationContext) {
    throw new Error('useAuthentication must be used inside AuthenticationProvider');
  }

  return authenticationContext;
};
