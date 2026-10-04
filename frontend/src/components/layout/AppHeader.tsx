import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { useAuthentication } from '../../hooks/useAuthentication';

// Top bar: menu toggle (mobile), app name, user name/role and logout
export function AppHeader({ onToggleNavigation }: { onToggleNavigation: () => void }) {
  const { currentUser, logout } = useAuthentication();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          edge="start"
          aria-label="פתיחת תפריט"
          onClick={onToggleNavigation}
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <LocalLibraryIcon sx={{ color: 'warning.main' }} />

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {HebrewTexts.applicationName}
        </Typography>

        {currentUser && (
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'end' }}>
            <Typography variant="body2">
              {currentUser.firstName} {currentUser.lastName}
            </Typography>

            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {HebrewTexts.roles[currentUser.role]}
            </Typography>
          </Box>
        )}

        <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
          {HebrewTexts.authentication.logout}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
