import { hasAnyPermission, type Permission } from '@library/shared';
import { useAuthentication } from './useAuthentication';

// True when the logged-in user has at least one of the permissions.
// Only hides UI - the backend still enforces every permission.
export const useCan = (...permissions: Permission[]): boolean => {
  const { currentUser } = useAuthentication();

  return currentUser !== null && hasAnyPermission(currentUser.role, permissions);
};
