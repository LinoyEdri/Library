import { ActionType, CopyStatus } from '@prisma/client';
import type { CopyStatusChange } from '../../types/database/copy-status-change.types.ts';

type SettableCopyStatus = 'AVAILABLE' | 'DAMAGED' | 'LOST' | 'DISABLED';

// Audit action recorded for each status staff can set
const auditActionByTargetStatus: Record<SettableCopyStatus, ActionType> = {
  [CopyStatus.AVAILABLE]: ActionType.BOOK_COPY_REACTIVATED,
  [CopyStatus.DAMAGED]: ActionType.BOOK_COPY_MARKED_DAMAGED,
  [CopyStatus.LOST]: ActionType.BOOK_COPY_MARKED_LOST,
  [CopyStatus.DISABLED]: ActionType.BOOK_COPY_DISABLED,
};

// Disabling remembers when and by whom; any other status clears those fields
export const buildCopyStatusChange = (
  targetStatus: SettableCopyStatus,
  actingUserId: string,
): CopyStatusChange => {
  const isDisabling = targetStatus === CopyStatus.DISABLED;

  return {
    data: {
      status: targetStatus,
      disabledDate: isDisabling ? new Date() : null,
      disabledByUserId: isDisabling ? actingUserId : null,
    },
    auditActionType: auditActionByTargetStatus[targetStatus],
  };
};
