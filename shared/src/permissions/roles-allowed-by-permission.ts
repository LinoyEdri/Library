import { Role } from "../enums/role.enum.js";
import { Permission } from "./permission.js";

const { ADMIN, LIBRARIAN, MEMBER, VIEWER } = Role;

const ALL_ROLES = [ADMIN, LIBRARIAN, MEMBER, VIEWER] as const;
const STAFF_ROLES = [ADMIN, LIBRARIAN] as const;

// Single source of truth for "who may do what" (from the Authorization and Pages Summary)
export const ROLES_ALLOWED_BY_PERMISSION: Record<Permission, readonly Role[]> = {
    [Permission.DASHBOARD_VIEW]: [ADMIN, LIBRARIAN, MEMBER],
    [Permission.PROFILE_MANAGE]: ALL_ROLES,

    // Books: librarians create/edit, only admins disable or reactivate
    [Permission.BOOKS_VIEW]: ALL_ROLES,
    [Permission.BOOKS_CREATE]: STAFF_ROLES,
    [Permission.BOOKS_UPDATE]: STAFF_ROLES,
    [Permission.BOOKS_DISABLE]: [ADMIN],
    [Permission.BOOK_COPIES_MANAGE]: STAFF_ROLES,

    // Catalog reference data: everyone views, only admins manage
    [Permission.AUTHORS_VIEW]: ALL_ROLES,
    [Permission.AUTHORS_MANAGE]: [ADMIN],
    [Permission.CATEGORIES_VIEW]: ALL_ROLES,
    [Permission.CATEGORIES_MANAGE]: [ADMIN],
    [Permission.PUBLISHERS_VIEW]: ALL_ROLES,
    [Permission.PUBLISHERS_MANAGE]: [ADMIN],
    [Permission.ADDRESSES_MANAGE]: [ADMIN],

    // Members: staff only (members see their own profile through PROFILE_MANAGE)
    [Permission.MEMBERS_VIEW]: STAFF_ROLES,
    [Permission.MEMBERS_MANAGE]: STAFF_ROLES,

    // Loans: staff see and process everything, members only their own
    [Permission.LOANS_VIEW_ALL]: STAFF_ROLES,
    [Permission.LOANS_VIEW_OWN]: [MEMBER],
    [Permission.LOANS_CREATE]: STAFF_ROLES,
    [Permission.LOANS_PROCESS_RETURN]: STAFF_ROLES,
    [Permission.LOANS_REQUEST_RETURN]: [MEMBER],

    // Administration
    [Permission.USERS_VIEW]: [ADMIN],
    [Permission.USERS_MANAGE]: [ADMIN],
    [Permission.AUDIT_LOGS_VIEW]: [ADMIN],
    [Permission.SETTINGS_MANAGE]: [ADMIN],
};
