import { RecordStatus } from '@prisma/client';
import type { RecordStatusChange } from '../../types/database/record-status-change.types.ts';

// "Remove" means disable: remember when and by whom, so history and audit stay intact
export const buildDisableStatusChange = (disabledByUserId: string): RecordStatusChange => ({
  status: RecordStatus.DISABLED,
  disabledDate: new Date(),
  disabledByUserId,
});

// Reactivating clears the disable details
export const buildReactivateStatusChange = (): RecordStatusChange => ({
  status: RecordStatus.ACTIVE,
  disabledDate: null,
  disabledByUserId: null,
});
