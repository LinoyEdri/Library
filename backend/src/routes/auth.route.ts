import { Router } from 'express';
import { changeOwnPasswordSchema, loginSchema, Permission, registerSchema } from '@library/shared';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { authenticationController } from '../controllers/authentication.controller.ts';

const authRouter = Router();

authRouter.post(
  '/register',
  validate(RequestLocation.BODY, registerSchema),
  authenticationController.register,
);

authRouter.post(
  '/login',
  validate(RequestLocation.BODY, loginSchema),
  authenticationController.login,
);

authRouter.get('/me', requireAuthentication, authenticationController.getCurrentUser);

authRouter.post(
  '/change-password',
  requireAuthentication,
  authorizePermission(Permission.PROFILE_MANAGE),
  validate(RequestLocation.BODY, changeOwnPasswordSchema),
  authenticationController.changePassword,
);

authRouter.post('/logout', requireAuthentication, authenticationController.logout);

export default authRouter;
