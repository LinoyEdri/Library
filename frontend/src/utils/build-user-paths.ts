import { RoutePaths } from '../constants/route-paths';

// "/users/:userId" -> "/users/0198..." for links to a specific user
export const buildUserDetailsPath = (userId: string): string =>
  RoutePaths.USER_DETAILS.replace(':userId', userId);

export const buildEditUserPath = (userId: string): string =>
  RoutePaths.EDIT_USER.replace(':userId', userId);
