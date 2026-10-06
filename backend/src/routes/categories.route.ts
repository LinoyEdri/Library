import { Router } from 'express';
import {
  categoryDetailsSchema,
  namedRecordListQuerySchema,
  Permission,
  recordIdParamsSchema,
} from '@library/shared';
import { categoryController } from '../controllers/category.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const categoriesRouter = Router();

// Every category endpoint needs a logged-in user
categoriesRouter.use(requireAuthentication);

categoriesRouter.get(
  '/',
  authorizePermission(Permission.CATEGORIES_VIEW),
  validate(RequestLocation.QUERY, namedRecordListQuerySchema),
  categoryController.listCategories,
);

categoriesRouter.get(
  '/:id',
  authorizePermission(Permission.CATEGORIES_VIEW),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  categoryController.getCategory,
);

categoriesRouter.post(
  '/',
  authorizePermission(Permission.CATEGORIES_MANAGE),
  validate(RequestLocation.BODY, categoryDetailsSchema),
  categoryController.createCategory,
);

categoriesRouter.patch(
  '/:id',
  authorizePermission(Permission.CATEGORIES_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, categoryDetailsSchema),
  categoryController.updateCategory,
);

categoriesRouter.post(
  '/:id/disable',
  authorizePermission(Permission.CATEGORIES_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  categoryController.disableCategory,
);

categoriesRouter.post(
  '/:id/reactivate',
  authorizePermission(Permission.CATEGORIES_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  categoryController.reactivateCategory,
);

export default categoriesRouter;
