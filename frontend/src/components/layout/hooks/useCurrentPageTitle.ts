import { useBreadcrumbItems } from './useBreadcrumbItems';

// The open page's name, taken from its breadcrumb (e.g. "השאלות")
export const useCurrentPageTitle = (): string => {
  const breadcrumbItems = useBreadcrumbItems();

  return breadcrumbItems[breadcrumbItems.length - 1]?.title ?? '';
};
