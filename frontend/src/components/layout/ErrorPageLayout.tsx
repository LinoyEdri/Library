import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { RoutePaths } from '../../constants/route-paths';

type ErrorPageLayoutProps = {
  statusCode: number;
  title: string;
  description: string;
  icon: ReactNode;
};

// Full-screen error message (403, 404) with a link back home
export function ErrorPageLayout({ statusCode, title, description, icon }: ErrorPageLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 480,
        }}
      >
        {icon}

        <Typography
          variant="h1"
          sx={{
            color: 'primary.main',
            fontSize: '4rem',
          }}
        >
          {statusCode}
        </Typography>

        <Typography
          variant="h2"
          component="h1"
          gutterBottom
        >
          {title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mb: 3,
          }}
        >
          {description}
        </Typography>

        <Button
          component={RouterLink}
          to={RoutePaths.HOME}
          variant="contained"
        >
          {HebrewTexts.errors.backToHome}
        </Button>
      </Box>
    </Box>
  );
}
