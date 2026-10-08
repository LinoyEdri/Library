import { hasAnyPermission, hasPermission } from '@library/shared';
import { NAVIGATION_ITEMS, type NavigationItem } from '../../../constants/navigation-items';
import { useAuthentication } from '../../../hooks/useAuthentication';

export type VisibleNavigationItem = Omit<NavigationItem, 'label'> & {
  displayedLabel: string;
};

// Menu items the current user's role may see, with the right label (e.g. "Browse Books")
export const useVisibleNavigationItems = (): VisibleNavigationItem[] => {
  const { currentUser } = useAuthentication();

  if (!currentUser) {
    return [];
  }

  return NAVIGATION_ITEMS.filter((item) =>
    hasAnyPermission(currentUser.role, item.requiredPermissions),
  ).map((item) => {
    const isBrowseOnly =
      item.browseOnlyUnlessPermission !== undefined &&
      !hasPermission(currentUser.role, item.browseOnlyUnlessPermission);

    return {
      ...item,
      displayedLabel: isBrowseOnly && item.browseOnlyLabel ? item.browseOnlyLabel : item.label,
    };
  });
};
