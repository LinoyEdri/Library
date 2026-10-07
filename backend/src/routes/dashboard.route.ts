import { Router } from 'express';
import { Permission } from '@library/shared';
import { dashboardController } from '../controllers/dashboard.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';

const dashboardRouter = Router();

// Members, librarians and admins each get the dashboard of their role; viewers have none
dashboardRouter.get(
  '/',
  requireAuthentication,
  authorizePermission(Permission.DASHBOARD_VIEW),
  dashboardController.getDashboard,
);

export default dashboardRouter;
