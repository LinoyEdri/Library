import { Router } from 'express';
import {
  createLoanSchema,
  loanListQuerySchema,
  Permission,
  processLoanReturnSchema,
  recordIdParamsSchema,
} from '@library/shared';
import { loanController } from '../controllers/loan.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const loansRouter = Router();

// Every loan endpoint needs a logged-in user
loansRouter.use(requireAuthentication);

// Staff see every loan; members see only their own (forced in the service)
loansRouter.get(
  '/',
  authorizePermission(Permission.LOANS_VIEW_ALL, Permission.LOANS_VIEW_OWN),
  validate(RequestLocation.QUERY, loanListQuerySchema),
  loanController.listLoans,
);

loansRouter.get(
  '/:id',
  authorizePermission(Permission.LOANS_VIEW_ALL, Permission.LOANS_VIEW_OWN),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  loanController.getLoan,
);

loansRouter.post(
  '/',
  authorizePermission(Permission.LOANS_CREATE),
  validate(RequestLocation.BODY, createLoanSchema),
  loanController.createLoan,
);

// Member actions on their own loan
loansRouter.post(
  '/:id/return-request',
  authorizePermission(Permission.LOANS_REQUEST_RETURN),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  loanController.requestReturn,
);

loansRouter.post(
  '/:id/return-request/cancel',
  authorizePermission(Permission.LOANS_REQUEST_RETURN),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  loanController.cancelReturnRequest,
);

// Staff actions
loansRouter.post(
  '/:id/return',
  authorizePermission(Permission.LOANS_PROCESS_RETURN),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, processLoanReturnSchema),
  loanController.processReturn,
);

loansRouter.post(
  '/:id/cancel',
  authorizePermission(Permission.LOANS_PROCESS_RETURN),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  loanController.cancelLoan,
);

export default loansRouter;
