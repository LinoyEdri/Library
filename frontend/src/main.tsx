import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { AuthenticationProvider } from './context/AuthenticationProvider';
import { NotificationProvider } from './context/NotificationProvider';
import { AppThemeProvider } from './theme/AppThemeProvider';

// Server-state cache shared by every page
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <AuthenticationProvider>
            <App />
          </AuthenticationProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  </StrictMode>,
);
