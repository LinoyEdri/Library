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
import { AuditLogsPage } from '../../pages/audit-logs/AuditLogsPage';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { AuthorsPage } from '../../pages/catalog/AuthorsPage';
import { BookDetailsPage } from '../../pages/books/BookDetailsPage';
import { BookFormPage } from '../../pages/books/BookFormPage';
import { BooksCatalogPage } from '../../pages/books/BooksCatalogPage';
import { MemberDetailsPage } from '../../pages/members/MemberDetailsPage';
import { MemberFormPage } from '../../pages/members/MemberFormPage';
import { MembersListPage } from '../../pages/members/MembersListPage';
import { UserDetailsPage } from '../../pages/users/UserDetailsPage';
import { UserFormPage } from '../../pages/users/UserFormPage';
import { UsersListPage } from '../../pages/users/UsersListPage';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import { LoanDetailsPage } from '../../pages/loans/LoanDetailsPage';
import { LoansListPage } from '../../pages/loans/LoansListPage';
import { CatalogSectionLayout } from '../../pages/catalog/CatalogSectionLayout';
import { CategoriesPage } from '../../pages/catalog/CategoriesPage';
import { PublishersPage } from '../../pages/catalog/PublishersPage';

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

const { navigation, catalog, books, members, users, loans } = HebrewTexts;

// One page inside the catalog section, guarded by a permission
const createPermissionGuardedRoute = (
  path: string,
  breadcrumb: string,
  permission: Permission,
  page: ReactNode,
): RouteObject => ({
  element: <RequirePermission permissions={[permission]} />,
  children: [{ path, element: page, handle: { breadcrumb } }],
});

// Books section: tabs (books, authors, categories, publishers), plus new / details / edit book pages
const catalogSectionRoute: RouteObject = {
  element: <RequirePermission permissions={[Permission.BOOKS_VIEW]} />,
  children: [
    {
      path: RoutePaths.BOOKS,
      handle: { breadcrumb: navigation.books },
      children: [
        {
          element: <CatalogSectionLayout />,
          children: [
            { index: true, element: <BooksCatalogPage /> },
            createPermissionGuardedRoute(
              RoutePaths.AUTHORS,
              catalog.authorsTab,
              Permission.AUTHORS_VIEW,
              <AuthorsPage />,
            ),
            createPermissionGuardedRoute(
              RoutePaths.CATEGORIES,
              catalog.categoriesTab,
              Permission.CATEGORIES_VIEW,
              <CategoriesPage />,
            ),
            createPermissionGuardedRoute(
              RoutePaths.PUBLISHERS,
              catalog.publishersTab,
              Permission.PUBLISHERS_VIEW,
              <PublishersPage />,
            ),
          ],
        },
        createPermissionGuardedRoute(
          RoutePaths.NEW_BOOK,
          books.newBookTitle,
          Permission.BOOKS_CREATE,
          <BookFormPage />,
        ),
        {
          path: RoutePaths.BOOK_DETAILS,
          handle: { breadcrumb: books.bookDetailsBreadcrumb },
          children: [
            { index: true, element: <BookDetailsPage /> },
            createPermissionGuardedRoute(
              RoutePaths.EDIT_BOOK,
              books.editBreadcrumb,
              Permission.BOOKS_UPDATE,
              <BookFormPage />,
            ),
          ],
        },
      ],
    },
  ],
};

// Members section: list, new member, member details and edit
const membersSectionRoute: RouteObject = {
  element: <RequirePermission permissions={[Permission.MEMBERS_VIEW]} />,
  children: [
    {
      path: RoutePaths.MEMBERS,
      handle: { breadcrumb: navigation.members },
      children: [
        { index: true, element: <MembersListPage /> },
        createPermissionGuardedRoute(
          RoutePaths.NEW_MEMBER,
          members.newMemberTitle,
          Permission.MEMBERS_MANAGE,
          <MemberFormPage />,
        ),
        {
          path: RoutePaths.MEMBER_DETAILS,
          handle: { breadcrumb: members.memberDetailsBreadcrumb },
          children: [
            { index: true, element: <MemberDetailsPage /> },
            createPermissionGuardedRoute(
              RoutePaths.EDIT_MEMBER,
              members.editBreadcrumb,
              Permission.MEMBERS_MANAGE,
              <MemberFormPage />,
            ),
          ],
        },
      ],
    },
  ],
};

// Loans section: list (staff see all, members their own) and loan details
const loansSectionRoute: RouteObject = {
  element: (
    <RequirePermission permissions={[Permission.LOANS_VIEW_ALL, Permission.LOANS_VIEW_OWN]} />
  ),
  children: [
    {
      path: RoutePaths.LOANS,
      handle: { breadcrumb: navigation.loans },
      children: [
        { index: true, element: <LoansListPage /> },
        {
          path: RoutePaths.LOAN_DETAILS,
          element: <LoanDetailsPage />,
          handle: { breadcrumb: loans.loanDetailsBreadcrumb },
        },
      ],
    },
  ],
};

// Users section (admin): list, new user, user details and edit
const usersSectionRoute: RouteObject = {
  element: <RequirePermission permissions={[Permission.USERS_VIEW]} />,
  children: [
    {
      path: RoutePaths.USERS,
      handle: { breadcrumb: navigation.users },
      children: [
        { index: true, element: <UsersListPage /> },
        createPermissionGuardedRoute(
          RoutePaths.NEW_USER,
          users.newUserTitle,
          Permission.USERS_MANAGE,
          <UserFormPage />,
        ),
        {
          path: RoutePaths.USER_DETAILS,
          handle: { breadcrumb: users.userDetailsBreadcrumb },
          children: [
            { index: true, element: <UserDetailsPage /> },
            createPermissionGuardedRoute(
              RoutePaths.EDIT_USER,
              users.editBreadcrumb,
              Permission.USERS_MANAGE,
              <UserFormPage />,
            ),
          ],
        },
      ],
    },
  ],
};

const protectedPageRoutes: RouteObject[] = [
  createProtectedPageRoute(
    RoutePaths.DASHBOARD,
    navigation.dashboard,
    [Permission.DASHBOARD_VIEW],
    <DashboardPage />,
  ),
  catalogSectionRoute,
  membersSectionRoute,
  loansSectionRoute,
  usersSectionRoute,
  createProtectedPageRoute(
    RoutePaths.AUDIT_LOGS,
    navigation.auditLogs,
    [Permission.AUDIT_LOGS_VIEW],
    <AuditLogsPage />,
  ),
  createProtectedPageRoute(
    RoutePaths.SETTINGS,
    navigation.settings,
    [Permission.SETTINGS_MANAGE],
    <SettingsPage />,
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
