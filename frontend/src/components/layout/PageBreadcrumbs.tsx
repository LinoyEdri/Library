import { Link as RouterLink } from 'react-router';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useBreadcrumbItems } from './hooks/useBreadcrumbItems';

// "Home / Books" trail above the page content (hidden on top-level pages)
export function PageBreadcrumbs() {
  const breadcrumbItems = useBreadcrumbItems();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <Breadcrumbs
      aria-label="מיקום בעמוד"
      sx={{
        mb: 2,
      }}
    >
      {breadcrumbItems.map((breadcrumbItem) =>
        breadcrumbItem.isCurrentPage ? (
          <Typography
            key={breadcrumbItem.id}
            color="text.primary"
          >
            {breadcrumbItem.title}
          </Typography>
        ) : (
          <Link
            key={breadcrumbItem.id}
            component={RouterLink}
            to={breadcrumbItem.path}
            underline="hover"
          >
            {breadcrumbItem.title}
          </Link>
        ),
      )}
    </Breadcrumbs>
  );
}
