import { useCallback, useMemo, useState } from 'react';
import type { AlertColor } from '@mui/material/Alert';

type VisibleNotification = {
  message: string;
  severity: AlertColor;
};

// State of the single toast shown by NotificationProvider
export const useNotificationProviderState = () => {
  const [visibleNotification, setVisibleNotification] = useState<VisibleNotification | null>(null);

  const showNotification = useCallback((message: string, severity: AlertColor = 'success') => {
    setVisibleNotification({ message, severity });
  }, []);

  const closeNotification = useCallback(() => setVisibleNotification(null), []);

  const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

  return {
    visibleNotification,
    closeNotification,
    contextValue,
  };
};
