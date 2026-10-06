import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { Permission } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';
import { AppLayout } from '../layout/AppLayout';
import { HomeRedirect } from './HomeRedirect';
import { RedirectIfAuthenticated } from './RedirectIfAuthenticated';
import { RequireAuthentication } from './RequireAuthentication';
import { RequirePermission } from './RequirePermission';
import { LoginPage } from '../../pages/authentication/LoginPage';
import { RegisterPage } from '../../pages/authentication/RegisterPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { NotFoundPage } from '../../pages/errors/NotFoundPage';
import { UnauthorizedPage } from '../../pages/errors/UnauthorizedPage';
import { ComingSoonPage } from '../../pages/placeholder/ComingSoonPage';
import { ProfilePage } from '../../pages/profile/ProfilePage';

// One page inside the app layout, guarded by permissions and shown in the breadcrumbs
const createProtectedPageRoute = (
  path: string,
  breadcrumb: string,
  permissions: Permission[],
  page: ReactNode,
): RouteObject => ({
  element: <RequirePermission permissions={permissions} />,
  children: [{ path, element: page, handle: { breadcrumb } }],
});

const { navigation } = HebrewTexts;

const protectedPageRoutes: RouteObject[] = [
  createProtectedPageRoute(
    RoutePaths.DASHBOARD,
    navigation.dashboard,
    [Permission.DASHBOARD_VIEW],
    <DashboardPage />,
  ),
  createProtectedPageRoute(
    RoutePaths.BOOKS,
    navigation.books,
    [Permission.BOOKS_VIEW],
    <ComingSoonPage title={navigation.books} />,
  ),
  createProtectedPageRoute(
    RoutePaths.MEMBERS,
    navigation.members,
    [Permission.MEMBERS_VIEW],
    <ComingSoonPage title={navigation.members} />,
  ),
  createProtectedPageRoute(
    RoutePaths.LOANS,
    navigation.loans,
    [Permission.LOANS_VIEW_ALL, Permission.LOANS_VIEW_OWN],
    <ComingSoonPage title={navigation.loans} />,
  ),
  createProtectedPageRoute(
    RoutePaths.USERS,
    navigation.users,
    [Permission.USERS_VIEW],
    <ComingSoonPage title={navigation.users} />,
  ),
  createProtectedPageRoute(
    RoutePaths.AUDIT_LOGS,
    navigation.auditLogs,
    [Permission.AUDIT_LOGS_VIEW],
    <ComingSoonPage title={navigation.auditLogs} />,
  ),
  createProtectedPageRoute(
    RoutePaths.SETTINGS,
    navigation.settings,
    [Permission.SETTINGS_MANAGE],
    <ComingSoonPage title={navigation.settings} />,
  ),
  createProtectedPageRoute(
    RoutePaths.PROFILE,
    navigation.profile,
    [Permission.PROFILE_MANAGE],
    <ProfilePage />,
  ),
];

export const applicationRouter = createBrowserRouter([
  // Guests only
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: RoutePaths.LOGIN, element: <LoginPage /> },
      { path: RoutePaths.REGISTER, element: <RegisterPage /> },
    ],
  },

  { path: RoutePaths.UNAUTHORIZED, element: <UnauthorizedPage /> },

  // Logged-in users, inside the app layout
  {
    element: <RequireAuthentication />,
    children: [
      {
        element: <AppLayout />,
        handle: { breadcrumb: navigation.home },
        children: [{ path: RoutePaths.HOME, element: <HomeRedirect /> }, ...protectedPageRoutes],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
