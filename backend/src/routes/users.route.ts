import { Router } from 'express';
import { Permission, updateOwnProfileSchema } from '@library/shared';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { profileController } from '../controllers/profile.controller.ts';

const usersRouter = Router();

usersRouter.patch(
  '/me',
  requireAuthentication,
  authorizePermission(Permission.PROFILE_MANAGE),
  validate(RequestLocation.BODY, updateOwnProfileSchema),
  profileController.updateOwnProfile,
);

export default usersRouter;
