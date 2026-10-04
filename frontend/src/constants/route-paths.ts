// Every URL in the app, so links never use hard-coded strings
export const RoutePaths = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',

  DASHBOARD: '/dashboard',
  BOOKS: '/books',
  MEMBERS: '/members',
  LOANS: '/loans',
  USERS: '/users',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;
