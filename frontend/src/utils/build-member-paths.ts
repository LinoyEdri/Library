import { RoutePaths } from '../constants/route-paths';

// "/members/:memberId" -> "/members/0198..." for links to a specific member
export const buildMemberDetailsPath = (memberId: string): string =>
  RoutePaths.MEMBER_DETAILS.replace(':memberId', memberId);

export const buildEditMemberPath = (memberId: string): string =>
  RoutePaths.EDIT_MEMBER.replace(':memberId', memberId);
