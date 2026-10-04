import { describe, expect, it } from 'vitest';
import { hasPermission, Permission, Role } from '@library/shared';

// Key rules from the "Authorization and Pages Summary" in the specification
describe('role permissions follow the specification', () => {
  it('only admins can disable or reactivate books; librarians can create and edit', () => {
    expect(hasPermission(Role.ADMIN, Permission.BOOKS_DISABLE)).toBe(true);
    expect(hasPermission(Role.LIBRARIAN, Permission.BOOKS_DISABLE)).toBe(false);
    expect(hasPermission(Role.LIBRARIAN, Permission.BOOKS_CREATE)).toBe(true);
    expect(hasPermission(Role.LIBRARIAN, Permission.BOOKS_UPDATE)).toBe(true);
  });

  it('everyone can view books, authors, categories and publishers', () => {
    for (const role of Object.values(Role)) {
      expect(hasPermission(role, Permission.BOOKS_VIEW)).toBe(true);
      expect(hasPermission(role, Permission.AUTHORS_VIEW)).toBe(true);
      expect(hasPermission(role, Permission.CATEGORIES_VIEW)).toBe(true);
      expect(hasPermission(role, Permission.PUBLISHERS_VIEW)).toBe(true);
    }
  });

  it('only admins manage authors, categories, publishers, users, audit log and settings', () => {
    const adminOnlyPermissions = [
      Permission.AUTHORS_MANAGE,
      Permission.CATEGORIES_MANAGE,
      Permission.PUBLISHERS_MANAGE,
      Permission.USERS_MANAGE,
      Permission.AUDIT_LOGS_VIEW,
      Permission.SETTINGS_MANAGE,
    ];

    for (const permission of adminOnlyPermissions) {
      expect(hasPermission(Role.ADMIN, permission)).toBe(true);
      expect(hasPermission(Role.LIBRARIAN, permission)).toBe(false);
      expect(hasPermission(Role.MEMBER, permission)).toBe(false);
    }
  });

  it('members request returns but only staff process them', () => {
    expect(hasPermission(Role.MEMBER, Permission.LOANS_REQUEST_RETURN)).toBe(true);
    expect(hasPermission(Role.MEMBER, Permission.LOANS_PROCESS_RETURN)).toBe(false);
    expect(hasPermission(Role.LIBRARIAN, Permission.LOANS_PROCESS_RETURN)).toBe(true);
    expect(hasPermission(Role.ADMIN, Permission.LOANS_PROCESS_RETURN)).toBe(true);
  });

  it('members see only their own loans; viewers see no loans at all', () => {
    expect(hasPermission(Role.MEMBER, Permission.LOANS_VIEW_OWN)).toBe(true);
    expect(hasPermission(Role.MEMBER, Permission.LOANS_VIEW_ALL)).toBe(false);
    expect(hasPermission(Role.VIEWER, Permission.LOANS_VIEW_OWN)).toBe(false);
    expect(hasPermission(Role.VIEWER, Permission.LOANS_VIEW_ALL)).toBe(false);
    expect(hasPermission(Role.VIEWER, Permission.LOANS_REQUEST_RETURN)).toBe(false);
  });

  it('viewers cannot manage members or open the dashboard', () => {
    expect(hasPermission(Role.VIEWER, Permission.MEMBERS_MANAGE)).toBe(false);
    expect(hasPermission(Role.VIEWER, Permission.DASHBOARD_VIEW)).toBe(false);
  });
});
