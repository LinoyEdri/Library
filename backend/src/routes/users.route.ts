import { Router } from 'express';
import {
  changeUserRoleSchema,
  createUserSchema,
  Permission,
  recordIdParamsSchema,
  updateOwnProfileSchema,
  updateUserSchema,
  userListQuerySchema,
} from '@library/shared';
import { profileController } from '../controllers/profile.controller.ts';
import { userManagementController } from '../controllers/user-management.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const usersRouter = Router();

// Every user endpoint needs a logged-in user
usersRouter.use(requireAuthentication);

// Own profile - declared before "/:id" so "me" is not read as a user id
usersRouter.patch(
  '/me',
  authorizePermission(Permission.PROFILE_MANAGE),
  validate(RequestLocation.BODY, updateOwnProfileSchema),
  profileController.updateOwnProfile,
);

// Admin user management
usersRouter.get(
  '/',
  authorizePermission(Permission.USERS_VIEW),
  validate(RequestLocation.QUERY, userListQuerySchema),
  userManagementController.listUsers,
);

usersRouter.get(
  '/:id',
  authorizePermission(Permission.USERS_VIEW),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  userManagementController.getUser,
);

usersRouter.post(
  '/',
  authorizePermission(Permission.USERS_MANAGE),
  validate(RequestLocation.BODY, createUserSchema),
  userManagementController.createUser,
);

usersRouter.patch(
  '/:id',
  authorizePermission(Permission.USERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, updateUserSchema),
  userManagementController.updateUser,
);

usersRouter.patch(
  '/:id/role',
  authorizePermission(Permission.USERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, changeUserRoleSchema),
  userManagementController.changeUserRole,
);

usersRouter.post(
  '/:id/disable',
  authorizePermission(Permission.USERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  userManagementController.disableUser,
);

usersRouter.post(
  '/:id/reactivate',
  authorizePermission(Permission.USERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  userManagementController.reactivateUser,
);

export default usersRouter;
