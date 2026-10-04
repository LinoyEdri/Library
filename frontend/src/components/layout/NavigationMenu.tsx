import { NavLink } from 'react-router';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useVisibleNavigationItems } from './hooks/useVisibleNavigationItems';

// Side menu links filtered by the current user's role
export function NavigationMenu({ onNavigate }: { onNavigate?: () => void }) {
  const visibleNavigationItems = useVisibleNavigationItems();

  return (
    <List
      component="nav"
      aria-label="ניווט ראשי"
      sx={{
        px: 1,
      }}
    >
      {visibleNavigationItems.map((item) => {
        const ItemIcon = item.icon;

        return (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              },
              '&.active .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
              }}
            >
              <ItemIcon />
            </ListItemIcon>

            <ListItemText primary={item.displayedLabel} />
          </ListItemButton>
        );
      })}
    </List>
  );
}
