import { Router } from 'express';
import {
  authorDetailsSchema,
  authorListQuerySchema,
  Permission,
  recordIdParamsSchema,
} from '@library/shared';
import { authorController } from '../controllers/author.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const authorsRouter = Router();

// Every author endpoint needs a logged-in user
authorsRouter.use(requireAuthentication);

authorsRouter.get(
  '/',
  authorizePermission(Permission.AUTHORS_VIEW),
  validate(RequestLocation.QUERY, authorListQuerySchema),
  authorController.listAuthors,
);

authorsRouter.get(
  '/:id',
  authorizePermission(Permission.AUTHORS_VIEW),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  authorController.getAuthor,
);

authorsRouter.post(
  '/',
  authorizePermission(Permission.AUTHORS_MANAGE),
  validate(RequestLocation.BODY, authorDetailsSchema),
  authorController.createAuthor,
);

authorsRouter.patch(
  '/:id',
  authorizePermission(Permission.AUTHORS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, authorDetailsSchema),
  authorController.updateAuthor,
);

authorsRouter.post(
  '/:id/disable',
  authorizePermission(Permission.AUTHORS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  authorController.disableAuthor,
);

authorsRouter.post(
  '/:id/reactivate',
  authorizePermission(Permission.AUTHORS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  authorController.reactivateAuthor,
);

export default authorsRouter;
