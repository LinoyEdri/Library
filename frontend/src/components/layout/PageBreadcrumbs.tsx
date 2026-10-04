import { Link as RouterLink, useMatches } from 'react-router';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// Routes add { handle: { breadcrumb: 'title' } } to appear here
type RouteHandleWithBreadcrumb = { breadcrumb?: string };

export function PageBreadcrumbs() {
  const routeMatches = useMatches();

  const breadcrumbMatches = routeMatches.filter(
    (match) => (match.handle as RouteHandleWithBreadcrumb | undefined)?.breadcrumb,
  );

  if (breadcrumbMatches.length <= 1) {
    return null;
  }

  return (
    <Breadcrumbs aria-label="מיקום בעמוד" sx={{ mb: 2 }}>
      {breadcrumbMatches.map((match, index) => {
        const breadcrumbTitle = (match.handle as RouteHandleWithBreadcrumb).breadcrumb;

        const isLastBreadcrumb = index === breadcrumbMatches.length - 1;

        return isLastBreadcrumb ? (
          <Typography key={match.id} color="text.primary">
            {breadcrumbTitle}
          </Typography>
        ) : (
          <Link key={match.id} component={RouterLink} to={match.pathname} underline="hover">
            {breadcrumbTitle}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
