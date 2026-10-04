import { useMatches } from 'react-router';

// Routes add { handle: { breadcrumb: 'title' } } to appear in the breadcrumbs
type RouteHandleWithBreadcrumb = {
  breadcrumb?: string;
};

export type BreadcrumbItem = {
  id: string;
  title: string;
  path: string;
  isCurrentPage: boolean;
};

// Breadcrumb trail for the current URL, built from the matched routes
export const useBreadcrumbItems = (): BreadcrumbItem[] => {
  const routeMatches = useMatches();

  const matchesWithBreadcrumb = routeMatches.filter(
    (match) => (match.handle as RouteHandleWithBreadcrumb | undefined)?.breadcrumb,
  );

  return matchesWithBreadcrumb.map((match, index) => ({
    id: match.id,
    title: (match.handle as RouteHandleWithBreadcrumb).breadcrumb ?? '',
    path: match.pathname,
    isCurrentPage: index === matchesWithBreadcrumb.length - 1,
  }));
};
