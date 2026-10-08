import type { SafeUserResponse, UpdateOwnProfileInput } from '@library/shared';
import { sendApiRequest } from './api-client';

// Calls for the logged-in user's own profile
export const profileApi = {
  updateOwnProfile: (profile: UpdateOwnProfileInput) =>
    sendApiRequest<SafeUserResponse>({ method: 'PATCH', url: '/users/me', data: profile }),
};
