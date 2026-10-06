import { Router } from 'express';
import {
  createMemberSchema,
  memberCandidateQuerySchema,
  memberDetailsSchema,
  memberListQuerySchema,
  Permission,
  recordIdParamsSchema,
} from '@library/shared';
import { memberController } from '../controllers/member.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const membersRouter = Router();

// Every member endpoint needs a logged-in user
membersRouter.use(requireAuthentication);

membersRouter.get(
  '/',
  authorizePermission(Permission.MEMBERS_VIEW),
  validate(RequestLocation.QUERY, memberListQuerySchema),
  memberController.listMembers,
);

// Declared before "/:id" so these words are not read as member ids
membersRouter.get(
  '/candidates',
  authorizePermission(Permission.MEMBERS_MANAGE),
  validate(RequestLocation.QUERY, memberCandidateQuerySchema),
  memberController.listMemberCandidates,
);

membersRouter.get(
  '/me',
  authorizePermission(Permission.LOANS_VIEW_OWN),
  memberController.getOwnMember,
);

// Staff see any member; members see only their own (checked in the service)
membersRouter.get(
  '/:id',
  authorizePermission(Permission.MEMBERS_VIEW, Permission.LOANS_VIEW_OWN),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  memberController.getMember,
);

membersRouter.post(
  '/',
  authorizePermission(Permission.MEMBERS_MANAGE),
  validate(RequestLocation.BODY, createMemberSchema),
  memberController.createMember,
);

membersRouter.patch(
  '/:id',
  authorizePermission(Permission.MEMBERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, memberDetailsSchema),
  memberController.updateMember,
);

membersRouter.post(
  '/:id/disable',
  authorizePermission(Permission.MEMBERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  memberController.disableMember,
);

membersRouter.post(
  '/:id/reactivate',
  authorizePermission(Permission.MEMBERS_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  memberController.reactivateMember,
);

export default membersRouter;
