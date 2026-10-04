// Active/disabled state for users, members, books and catalog records - must match Prisma `RecordStatus`
export const RecordStatus = {
    ACTIVE: "ACTIVE",
    DISABLED: "DISABLED",
} as const;

export type RecordStatus = (typeof RecordStatus)[keyof typeof RecordStatus];
