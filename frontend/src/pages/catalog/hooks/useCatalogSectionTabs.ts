import { useLocation } from 'react-router';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { RoutePaths } from '../../../constants/route-paths';

// Tabs of the catalog section, in display order
const CATALOG_SECTION_TABS = [
  { label: HebrewTexts.catalog.booksTab, path: RoutePaths.BOOKS },
  { label: HebrewTexts.catalog.authorsTab, path: RoutePaths.AUTHORS },
  { label: HebrewTexts.catalog.categoriesTab, path: RoutePaths.CATEGORIES },
  { label: HebrewTexts.catalog.publishersTab, path: RoutePaths.PUBLISHERS },
];

// The tabs plus which one matches the current URL
export const useCatalogSectionTabs = () => {
  const { pathname } = useLocation();

  const selectedTab =
    CATALOG_SECTION_TABS.find(
      (tab) => tab.path !== RoutePaths.BOOKS && pathname.startsWith(tab.path),
    )?.path ?? RoutePaths.BOOKS;

  return {
    tabs: CATALOG_SECTION_TABS,
    selectedTab,
  };
};
