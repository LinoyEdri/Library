import type { SystemSettingKey } from '@library/shared';

// One setting as returned by GET /settings
export interface SystemSettingRecordResponse {
  key: SystemSettingKey;
  value: number;
  defaultValue: number;
  // Null while the default is in use (nothing stored yet)
  updatedDate: Date | null;
}
