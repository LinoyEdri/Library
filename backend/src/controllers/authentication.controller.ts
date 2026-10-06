import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { getStatusText } from '../utils/http/status-text.ts';
import { authenticationService } from '../services/authentication.service.ts';
import { profileService } from '../services/profile.service.ts';
import { ApiResponse } from '../utils/http/api-response.ts';

// Thin HTTP layer: read the request, call the service, wrap the result in the envelope
export const authenticationController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const newUser = await authenticationService.register(req.body);

    res
      .status(StatusCodes.CREATED)
      .json(
        ApiResponse.success(
          newUser,
          'User registered successfully',
          getStatusText(StatusCodes.CREATED),
        ),
      );
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const loginResult = await authenticationService.login(req.body);

    res.status(StatusCodes.OK).json(ApiResponse.success(loginResult, 'Login successful'));
  }),

  getCurrentUser: catchAsync(async (req: Request, res: Response) => {
    const currentUser = await authenticationService.getCurrentUser(getAuthenticatedUser(req).id);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success(currentUser, 'User retrieved successfully'));
  }),

  changePassword: catchAsync(async (req: Request, res: Response) => {
    await profileService.changeOwnPassword(getAuthenticatedUser(req), req.body);

    res.status(StatusCodes.OK).json(ApiResponse.success(null, 'Password changed successfully'));
  }),

  logout: catchAsync(async (req: Request, res: Response) => {
    await authenticationService.logout(getAuthenticatedUser(req));

    res.status(StatusCodes.OK).json(ApiResponse.success(null, 'Logged out successfully'));
  }),
};
