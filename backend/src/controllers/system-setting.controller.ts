import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { systemSettingService } from '../services/system-setting.service.ts';
import type { SystemSettingKeyParams } from '../types/requests/system-setting.requests.types.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';

export const systemSettingController = {
  listSettings: catchAsync(async (_req: Request, res: Response) => {
    const settings = await systemSettingService.listSettings();

    res.status(StatusCodes.OK).json(ApiResponse.success(settings, 'Settings retrieved'));
  }),

  updateSetting: catchAsync(async (req: Request, res: Response) => {
    const { key } = req.params as unknown as SystemSettingKeyParams;

    const setting = await systemSettingService.updateSetting(
      getAuthenticatedUser(req),
      key,
      req.body.value,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(setting, 'Setting updated'));
  }),
};
