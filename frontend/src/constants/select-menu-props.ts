import type { MenuProps } from '@mui/material/Menu';

// Opens a select's options under the field instead of on top of it. A long list drawn over the
// field can catch the release of the opening click and pick an option by accident.
export const BELOW_FIELD_SELECT_MENU_PROPS: Partial<MenuProps> = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'center',
  },
  slotProps: {
    paper: {
      sx: {
        maxHeight: 360,
      },
    },
  },
};
