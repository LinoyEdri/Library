import type { Role } from "../enums/role.enum.js";
import type { Permission } from "./permission.js";
import { ROLES_ALLOWED_BY_PERMISSION } from "./roles-allowed-by-permission.js";

// True when the role is allowed to perform the action
export const hasPermission = (role: Role, permission: Permission): boolean =>
    ROLES_ALLOWED_BY_PERMISSION[permission].includes(role);

// True when the role has at least one of the given permissions
export const hasAnyPermission = (role: Role, permissions: readonly Permission[]): boolean =>
    permissions.some((permission) => hasPermission(role, permission));
