import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { profileService } from '../services/profile.service.ts';
import { ApiResponse } from '../utils/http/api-response.ts';

// The logged-in user's own account (/users/me)
export const profileController = {
  updateOwnProfile: catchAsync(async (req: Request, res: Response) => {
    const updatedUser = await profileService.updateOwnProfile(getAuthenticatedUser(req), req.body);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success(updatedUser, 'Profile updated successfully'));
  }),
};
