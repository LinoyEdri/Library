import type { RecordStatus } from '@prisma/client';

// Columns written when a record is disabled or reactivated
export interface RecordStatusChange {
  status: RecordStatus;
  disabledDate: Date | null;
  disabledByUserId: string | null;
}
