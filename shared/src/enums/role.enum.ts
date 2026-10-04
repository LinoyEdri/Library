// User roles - must match the Prisma `Role` enum
export const Role = {
    ADMIN: "ADMIN",
    LIBRARIAN: "LIBRARIAN",
    MEMBER: "MEMBER",
    VIEWER: "VIEWER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
