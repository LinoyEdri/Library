import type { ReactNode } from 'react';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { libraryTheme } from './library-theme';
import { rightToLeftEmotionCache } from './right-to-left-emotion-cache';
import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource/heebo/700.css';

// Wraps the app with the RTL style cache, the MUI theme and baseline CSS
export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={rightToLeftEmotionCache}>
      <ThemeProvider theme={libraryTheme}>
        <CssBaseline />

        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
