import { useCallback, useMemo, useState, type ReactNode } from 'react';
import Alert, { type AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { NotificationContext } from './notification-context';

type VisibleNotification = {
  message: string;
  severity: AlertColor;
};

const NOTIFICATION_DURATION_MILLISECONDS = 5000;

// Shows one toast at a time at the bottom of the screen
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [visibleNotification, setVisibleNotification] = useState<VisibleNotification | null>(null);

  const showNotification = useCallback((message: string, severity: AlertColor = 'success') => {
    setVisibleNotification({ message, severity });
  }, []);

  const closeNotification = () => setVisibleNotification(null);

  const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      <Snackbar
        open={visibleNotification !== null}
        autoHideDuration={NOTIFICATION_DURATION_MILLISECONDS}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeNotification}
          severity={visibleNotification?.severity ?? 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {visibleNotification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
