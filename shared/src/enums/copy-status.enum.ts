// State of a physical book copy - must match Prisma `CopyStatus`
export const CopyStatus = {
    AVAILABLE: "AVAILABLE",
    ON_LOAN: "ON_LOAN",
    DISABLED: "DISABLED",
    LOST: "LOST",
    DAMAGED: "DAMAGED",
} as const;

export type CopyStatus = (typeof CopyStatus)[keyof typeof CopyStatus];
