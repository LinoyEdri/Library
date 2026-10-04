import { Navigate } from 'react-router';
import { useHomeRedirectPath } from './hooks/useHomeRedirectPath';

// Sends "/" to the user's starting page
export function HomeRedirect() {
  const homePath = useHomeRedirectPath();

  return (
    <Navigate
      to={homePath}
      replace
    />
  );
}
