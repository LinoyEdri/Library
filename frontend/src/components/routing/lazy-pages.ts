import { lazyPage } from './lazy-page';

// Every page, loaded on first visit so the first download stays small (Suspense shows a loader)

export const LoginPage = lazyPage(
  () => import('../../pages/authentication/LoginPage'),
  'LoginPage',
);

export const RegisterPage = lazyPage(
  () => import('../../pages/authentication/RegisterPage'),
  'RegisterPage',
);

export const ForgotPasswordPage = lazyPage(
  () => import('../../pages/authentication/ForgotPasswordPage'),
  'ForgotPasswordPage',
);

export const ResetPasswordPage = lazyPage(
  () => import('../../pages/authentication/ResetPasswordPage'),
  'ResetPasswordPage',
);

export const DashboardPage = lazyPage(
  () => import('../../pages/dashboard/DashboardPage'),
  'DashboardPage',
);

export const NotFoundPage = lazyPage(
  () => import('../../pages/errors/NotFoundPage'),
  'NotFoundPage',
);

export const UnauthorizedPage = lazyPage(
  () => import('../../pages/errors/UnauthorizedPage'),
  'UnauthorizedPage',
);

export const AuditLogsPage = lazyPage(
  () => import('../../pages/audit-logs/AuditLogsPage'),
  'AuditLogsPage',
);

export const ProfilePage = lazyPage(() => import('../../pages/profile/ProfilePage'), 'ProfilePage');

export const AuthorsPage = lazyPage(() => import('../../pages/catalog/AuthorsPage'), 'AuthorsPage');

export const BookDetailsPage = lazyPage(
  () => import('../../pages/books/BookDetailsPage'),
  'BookDetailsPage',
);

export const BookFormPage = lazyPage(
  () => import('../../pages/books/BookFormPage'),
  'BookFormPage',
);

export const BooksCatalogPage = lazyPage(
  () => import('../../pages/books/BooksCatalogPage'),
  'BooksCatalogPage',
);

export const MemberDetailsPage = lazyPage(
  () => import('../../pages/members/MemberDetailsPage'),
  'MemberDetailsPage',
);

export const MemberFormPage = lazyPage(
  () => import('../../pages/members/MemberFormPage'),
  'MemberFormPage',
);

export const MembersListPage = lazyPage(
  () => import('../../pages/members/MembersListPage'),
  'MembersListPage',
);

export const UserDetailsPage = lazyPage(
  () => import('../../pages/users/UserDetailsPage'),
  'UserDetailsPage',
);

export const UserFormPage = lazyPage(
  () => import('../../pages/users/UserFormPage'),
  'UserFormPage',
);

export const UsersListPage = lazyPage(
  () => import('../../pages/users/UsersListPage'),
  'UsersListPage',
);

export const SettingsPage = lazyPage(
  () => import('../../pages/settings/SettingsPage'),
  'SettingsPage',
);

export const LoanDetailsPage = lazyPage(
  () => import('../../pages/loans/LoanDetailsPage'),
  'LoanDetailsPage',
);

export const LoansListPage = lazyPage(
  () => import('../../pages/loans/LoansListPage'),
  'LoansListPage',
);

export const CatalogSectionLayout = lazyPage(
  () => import('../../pages/catalog/CatalogSectionLayout'),
  'CatalogSectionLayout',
);

export const CategoriesPage = lazyPage(
  () => import('../../pages/catalog/CategoriesPage'),
  'CategoriesPage',
);

export const PublishersPage = lazyPage(
  () => import('../../pages/catalog/PublishersPage'),
  'PublishersPage',
);
