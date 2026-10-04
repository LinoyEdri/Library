import type { Role } from "@prisma/client";

// Who is making the request - attached to req.user by requireAuthentication.
// Values come from the database (not the token), so role changes and disabling apply immediately.
export interface AuthenticatedUser {
    id: string;
    email: string;
    role: Role;
    memberId: string | null;
}
