import { RecordStatus } from '@prisma/client';

// Managers may filter by any status (or see all). Everyone else only ever sees active records.
export const resolveVisibleRecordStatus = (
  requestedStatus: RecordStatus | undefined,
  canSeeDisabledRecords: boolean,
): RecordStatus | undefined => (canSeeDisabledRecords ? requestedStatus : RecordStatus.ACTIVE);
