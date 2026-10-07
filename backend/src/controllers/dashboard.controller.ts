import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { dashboardService } from '../services/dashboard.service.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';

export const dashboardController = {
  getDashboard: catchAsync(async (req: Request, res: Response) => {
    const dashboard = await dashboardService.getDashboard(getAuthenticatedUser(req));

    res.status(StatusCodes.OK).json(ApiResponse.success(dashboard, 'Dashboard retrieved'));
  }),
};
