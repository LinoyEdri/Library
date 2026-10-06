import type { RecordStatus } from '@prisma/client';

// Lifecycle fields every disable-able catalog record exposes
interface RecordLifecycleFields {
  id: string;
  status: RecordStatus;
  createdDate: Date;
  updatedDate: Date;
  disabledDate: Date | null;
}

export interface AuthorRecordResponse extends RecordLifecycleFields {
  firstName: string;
  lastName: string;
  biography: string | null;
}

export interface PublisherRecordResponse extends RecordLifecycleFields {
  name: string;
  description: string | null;
}

export interface CategoryRecordResponse extends RecordLifecycleFields {
  name: string;
}
