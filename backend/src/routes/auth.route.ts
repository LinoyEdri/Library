import { Router } from 'express';
import {
  changeOwnPasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  Permission,
  registerSchema,
  resetPasswordSchema,
  verifyPasswordResetCodeSchema,
} from '@library/shared';
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

// Forgot password (guests): send a code by email/SMS, verify it, then set the new password
authRouter.post(
  '/forgot-password',
  validate(RequestLocation.BODY, forgotPasswordSchema),
  authenticationController.forgotPassword,
);

authRouter.post(
  '/forgot-password/verify',
  validate(RequestLocation.BODY, verifyPasswordResetCodeSchema),
  authenticationController.verifyPasswordResetCode,
);

authRouter.post(
  '/reset-password',
  validate(RequestLocation.BODY, resetPasswordSchema),
  authenticationController.resetPassword,
);

authRouter.post('/logout', requireAuthentication, authenticationController.logout);

export default authRouter;
