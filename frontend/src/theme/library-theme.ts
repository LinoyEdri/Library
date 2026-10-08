import { createTheme } from '@mui/material/styles';

// Brand colors from the design system section of the specification
export const brandColors = {
  ivoryBackground: '#F8F6F1',
  deepNavy: '#17324D',
  forestGreen: '#2F6B5F',
  mutedGold: '#C49A5A',
  surfaceWhite: '#FFFFFF',
  textPrimary: '#1F2A37',
  textSecondary: '#5B6573',
} as const;

// Application-wide MUI theme: right-to-left, Heebo font, brand palette, rounded cards
export const libraryTheme = createTheme({
  direction: 'rtl',

  palette: {
    primary: { main: brandColors.deepNavy },
    secondary: { main: brandColors.forestGreen },
    // Gold is light: text on gold is navy (white fails contrast); gold text on white uses warning.dark
    warning: { main: brandColors.mutedGold, contrastText: brandColors.deepNavy },
    background: { default: brandColors.ivoryBackground, paper: brandColors.surfaceWhite },
    text: { primary: brandColors.textPrimary, secondary: brandColors.textSecondary },
  },

  typography: {
    fontFamily: '"Heebo", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.625rem', fontWeight: 700 },
    h3: { fontSize: '1.375rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.125rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { fontWeight: 500, textTransform: 'none' },
  },

  shape: { borderRadius: 10 },

  components: {
    // Outlined gold chips (e.g. the member role) show gold text on white: use the darker gold
    MuiChip: {
      variants: [
        {
          props: { variant: 'outlined', color: 'warning' },
          style: ({ theme }) => ({
            color: theme.palette.warning.dark,
            borderColor: theme.palette.warning.dark,
          }),
        },
      ],
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 2px 10px rgba(23, 50, 77, 0.08)',
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
    },

    MuiTextField: {
      defaultProps: { fullWidth: true, size: 'small' },
    },
  },
});
