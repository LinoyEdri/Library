// Kind of record an audit log entry refers to - must match Prisma `EntityType`
export const EntityType = {
    USER: "USER",
    MEMBER: "MEMBER",
    ADDRESS: "ADDRESS",
    BOOK: "BOOK",
    BOOK_COPY: "BOOK_COPY",
    AUTHOR: "AUTHOR",
    PUBLISHER: "PUBLISHER",
    CATEGORY: "CATEGORY",
    LOAN: "LOAN",
    SYSTEM_SETTING: "SYSTEM_SETTING",
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];
