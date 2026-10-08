import type { ActionType, CopyStatus } from '@prisma/client';

// Columns written when staff change a copy's status, plus the matching audit action
export interface CopyStatusChange {
  data: {
    status: CopyStatus;
    disabledDate: Date | null;
    disabledByUserId: string | null;
  };
  auditActionType: ActionType;
}
