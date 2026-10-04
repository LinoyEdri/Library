import { Outlet } from 'react-router';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import { AppHeader } from './AppHeader';
import { NavigationMenu } from './NavigationMenu';
import { PageBreadcrumbs } from './PageBreadcrumbs';
import { useMobileNavigationDrawer } from './hooks/useMobileNavigationDrawer';

const NAVIGATION_DRAWER_WIDTH = 240;

const drawerPaperStyle = {
  width: NAVIGATION_DRAWER_WIDTH,
  boxSizing: 'border-box',
} as const;

// Shell for logged-in pages: header, side menu (fixed on desktop, sliding on mobile) and content
export function AppLayout() {
  const { isMobileNavigationOpen, toggleMobileNavigation, closeMobileNavigation } =
    useMobileNavigationDrawer();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <AppHeader onToggleNavigation={toggleMobileNavigation} />

      {/* Mobile: opens from the menu button. Anchor "left" is flipped to the right in RTL. */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={isMobileNavigationOpen}
        onClose={closeMobileNavigation}
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },
          '& .MuiDrawer-paper': drawerPaperStyle,
        }}
      >
        <Toolbar />

        <NavigationMenu onNavigate={closeMobileNavigation} />
      </Drawer>

      {/* Desktop: always visible */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: {
            xs: 'none',
            md: 'block',
          },
          width: NAVIGATION_DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': drawerPaperStyle,
        }}
      >
        <Toolbar />

        <NavigationMenu />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: {
            xs: 2,
            md: 3,
          },
        }}
      >
        <Toolbar />

        <PageBreadcrumbs />

        <Outlet />
      </Box>
    </Box>
  );
}
