import type { SystemSettingKey, SystemSettingResponse } from '@library/shared';
import { sendApiRequest } from './api-client';

// Calls to /settings (admin)
export const settingsApi = {
  list: () => sendApiRequest<SystemSettingResponse[]>({ method: 'GET', url: '/settings' }),

  update: (key: SystemSettingKey, value: number) =>
    sendApiRequest<SystemSettingResponse>({
      method: 'PATCH',
      url: `/settings/${key}`,
      data: { value },
    }),
};
