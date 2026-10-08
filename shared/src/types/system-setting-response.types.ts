import type { SystemSettingKey } from '../settings/system-setting-key.js';

// One setting as shown on the Settings page
export interface SystemSettingResponse {
  key: SystemSettingKey;
  value: number;
  defaultValue: number;
  // ISO date of the last change; null while the default is in use
  updatedDate: string | null;
}
