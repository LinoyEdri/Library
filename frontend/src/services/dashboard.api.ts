import type { DashboardResponse } from '@library/shared';
import { sendApiRequest } from './api-client';

// Calls to /dashboard (the payload depends on the user's role)
export const dashboardApi = {
  get: () => sendApiRequest<DashboardResponse>({ method: 'GET', url: '/dashboard' }),
};
