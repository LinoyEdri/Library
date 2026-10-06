import type { RecordStatus } from '../enums/record-status.enum.js';

// Lifecycle fields every disable-able catalog record has. Dates are ISO strings.
interface RecordLifecycleResponse {
  id: string;
  status: RecordStatus;
  createdDate: string;
  updatedDate: string;
  disabledDate: string | null;
}

export interface AuthorResponse extends RecordLifecycleResponse {
  firstName: string;
  lastName: string;
  biography: string | null;
}

export interface PublisherResponse extends RecordLifecycleResponse {
  name: string;
  description: string | null;
}

export interface CategoryResponse extends RecordLifecycleResponse {
  name: string;
}
