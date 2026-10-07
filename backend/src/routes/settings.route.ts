import { Router } from 'express';
import {
  Permission,
  systemSettingKeyParamsSchema,
  updateSystemSettingSchema,
} from '@library/shared';
import { systemSettingController } from '../controllers/system-setting.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const settingsRouter = Router();

// Settings are for admins only
settingsRouter.use(requireAuthentication, authorizePermission(Permission.SETTINGS_MANAGE));

settingsRouter.get('/', systemSettingController.listSettings);

settingsRouter.patch(
  '/:key',
  validate(RequestLocation.PARAMS, systemSettingKeyParamsSchema),
  validate(RequestLocation.BODY, updateSystemSettingSchema),
  systemSettingController.updateSetting,
);

export default settingsRouter;
