import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userManagementService } from '../services/user-management.service.ts';
import type { UserListQueryInput } from '../types/requests/user-management.requests.types.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

// Admin user management (/users)
export const userManagementController = {
  listUsers: catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as UserListQueryInput;

    const { items, meta } = await userManagementService.listUsers(query);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success(items, 'Users retrieved', getStatusText(StatusCodes.OK), meta));
  }),

  getUser: catchAsync(async (req: Request, res: Response) => {
    const user = await userManagementService.getUser(String(req.params.id));

    res.status(StatusCodes.OK).json(ApiResponse.success(user, 'User retrieved'));
  }),

  createUser: catchAsync(async (req: Request, res: Response) => {
    const user = await userManagementService.createUser(getAuthenticatedUser(req), req.body);

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(user, 'User created', getStatusText(StatusCodes.CREATED)));
  }),

  updateUser: catchAsync(async (req: Request, res: Response) => {
    const user = await userManagementService.updateUser(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(user, 'User updated'));
  }),

  changeUserRole: catchAsync(async (req: Request, res: Response) => {
    const user = await userManagementService.changeUserRole(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body.role,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(user, 'User role changed'));
  }),

  disableUser: catchAsync(async (req: Request, res: Response) => {
    const user = await userManagementService.disableUser(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(user, 'User disabled'));
  }),

  reactivateUser: catchAsync(async (req: Request, res: Response) => {
    const user = await userManagementService.reactivateUser(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(user, 'User reactivated'));
  }),
};
