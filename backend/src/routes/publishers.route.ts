import { Router } from 'express';
import {
  namedRecordListQuerySchema,
  Permission,
  publisherDetailsSchema,
  recordIdParamsSchema,
} from '@library/shared';
import { publisherController } from '../controllers/publisher.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const publishersRouter = Router();

// Every publisher endpoint needs a logged-in user
publishersRouter.use(requireAuthentication);

publishersRouter.get(
  '/',
  authorizePermission(Permission.PUBLISHERS_VIEW),
  validate(RequestLocation.QUERY, namedRecordListQuerySchema),
  publisherController.listPublishers,
);

publishersRouter.get(
  '/:id',
  authorizePermission(Permission.PUBLISHERS_VIEW),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  publisherController.getPublisher,
);

publishersRouter.post(
  '/',
  authorizePermission(Permission.PUBLISHERS_MANAGE),
  validate(RequestLocation.BODY, publisherDetailsSchema),
  publisherController.createPublisher,
);

publishersRouter.patch(
  '/:id',
  authorizePermission(Permission.PUBLISHERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, publisherDetailsSchema),
  publisherController.updatePublisher,
);

publishersRouter.post(
  '/:id/disable',
  authorizePermission(Permission.PUBLISHERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  publisherController.disablePublisher,
);

publishersRouter.post(
  '/:id/reactivate',
  authorizePermission(Permission.PUBLISHERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  publisherController.reactivatePublisher,
);

export default publishersRouter;
