import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { HebrewTexts } from '../../constants/hebrew-texts';

type AuthenticationPageLayoutProps = {
  title: string;
  subtitle: string;
  maxWidth?: number;
  children: ReactNode;
};

// Centered card used by the login and sign-up pages
export function AuthenticationPageLayout({
  title,
  subtitle,
  maxWidth = 420,
  children,
}: AuthenticationPageLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LocalLibraryIcon sx={{ fontSize: 48, color: 'primary.main' }} />

            <Typography variant="body2" color="text.secondary">
              {HebrewTexts.applicationName}
            </Typography>

            <Typography variant="h2" component="h1" sx={{ mt: 1 }}>
              {title}
            </Typography>

            <Typography color="text.secondary">{subtitle}</Typography>
          </Box>

          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
