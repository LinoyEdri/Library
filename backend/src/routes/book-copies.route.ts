import { Router } from 'express';
import { changeBookCopyStatusSchema, Permission, recordIdParamsSchema } from '@library/shared';
import { bookCopyController } from '../controllers/book-copy.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const bookCopiesRouter = Router();

bookCopiesRouter.patch(
  '/:id/status',
  requireAuthentication,
  authorizePermission(Permission.BOOK_COPIES_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, changeBookCopyStatusSchema),
  bookCopyController.changeCopyStatus,
);

export default bookCopiesRouter;
