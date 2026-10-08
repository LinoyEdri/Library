// Every protected action in the system. Routes (backend) and buttons/menus (frontend) check these.
export const Permission = {
  DASHBOARD_VIEW: 'dashboard:view',
  PROFILE_MANAGE: 'profile:manage',

  BOOKS_VIEW: 'books:view',
  BOOKS_CREATE: 'books:create',
  BOOKS_UPDATE: 'books:update',
  BOOKS_DISABLE: 'books:disable',
  BOOK_COPIES_MANAGE: 'bookCopies:manage',

  AUTHORS_VIEW: 'authors:view',
  AUTHORS_MANAGE: 'authors:manage',
  CATEGORIES_VIEW: 'categories:view',
  CATEGORIES_MANAGE: 'categories:manage',
  PUBLISHERS_VIEW: 'publishers:view',
  PUBLISHERS_MANAGE: 'publishers:manage',
  ADDRESSES_MANAGE: 'addresses:manage',

  MEMBERS_VIEW: 'members:view',
  MEMBERS_MANAGE: 'members:manage',

  LOANS_VIEW_ALL: 'loans:viewAll',
  LOANS_VIEW_OWN: 'loans:viewOwn',
  LOANS_CREATE: 'loans:create',
  LOANS_PROCESS_RETURN: 'loans:processReturn',
  LOANS_REQUEST_RETURN: 'loans:requestReturn',

  USERS_VIEW: 'users:view',
  USERS_MANAGE: 'users:manage',
  AUDIT_LOGS_VIEW: 'auditLogs:view',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
