import type { SvgIconComponent } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Permission } from '@library/shared';
import { HebrewTexts } from './hebrew-texts';
import { RoutePaths } from './route-paths';

export interface NavigationItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
  // Shown when the user has at least one of these permissions
  requiredPermissions: Permission[];
  // Label for users who can only browse (e.g. "Browse Books" for members and viewers)
  browseOnlyLabel?: string;
  browseOnlyUnlessPermission?: Permission;
}

// Side menu. Each role sees only the items its permissions allow, which matches the
// per-role navigation lists in the specification.
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: HebrewTexts.navigation.dashboard,
    path: RoutePaths.DASHBOARD,
    icon: DashboardIcon,
    requiredPermissions: [Permission.DASHBOARD_VIEW],
  },
  {
    label: HebrewTexts.navigation.books,
    path: RoutePaths.BOOKS,
    icon: MenuBookIcon,
    requiredPermissions: [Permission.BOOKS_VIEW],
    browseOnlyLabel: HebrewTexts.navigation.browseBooks,
    browseOnlyUnlessPermission: Permission.BOOKS_CREATE,
  },
  {
    label: HebrewTexts.navigation.members,
    path: RoutePaths.MEMBERS,
    icon: GroupIcon,
    requiredPermissions: [Permission.MEMBERS_VIEW],
  },
  {
    label: HebrewTexts.navigation.loans,
    path: RoutePaths.LOANS,
    icon: SwapHorizIcon,
    requiredPermissions: [Permission.LOANS_VIEW_ALL, Permission.LOANS_VIEW_OWN],
  },
  {
    label: HebrewTexts.navigation.users,
    path: RoutePaths.USERS,
    icon: AdminPanelSettingsIcon,
    requiredPermissions: [Permission.USERS_VIEW],
  },
  {
    label: HebrewTexts.navigation.auditLogs,
    path: RoutePaths.AUDIT_LOGS,
    icon: HistoryIcon,
    requiredPermissions: [Permission.AUDIT_LOGS_VIEW],
  },
  {
    label: HebrewTexts.navigation.settings,
    path: RoutePaths.SETTINGS,
    icon: SettingsIcon,
    requiredPermissions: [Permission.SETTINGS_MANAGE],
  },
  {
    label: HebrewTexts.navigation.profile,
    path: RoutePaths.PROFILE,
    icon: PersonIcon,
    requiredPermissions: [Permission.PROFILE_MANAGE],
  },
];
