import type { ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useNotificationProviderState } from './hooks/useNotificationProviderState';
import { NotificationContext } from './notification-context';

const NOTIFICATION_DURATION_MILLISECONDS = 5000;

// Shows one toast at a time at the bottom of the screen
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { visibleNotification, closeNotification, contextValue } = useNotificationProviderState();

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      <Snackbar
        open={visibleNotification !== null}
        autoHideDuration={NOTIFICATION_DURATION_MILLISECONDS}
        onClose={closeNotification}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Alert
          onClose={closeNotification}
          severity={visibleNotification?.severity ?? 'info'}
          variant="filled"
          sx={{
            width: '100%',
          }}
        >
          {visibleNotification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
