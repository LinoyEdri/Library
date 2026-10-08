import { createContext } from 'react';
import type { AlertColor } from '@mui/material/Alert';

export interface NotificationContextValue {
  showNotification: (message: string, severity?: AlertColor) => void;
}

// Pop-up messages (success/error toasts), provided by NotificationProvider
export const NotificationContext = createContext<NotificationContextValue | null>(null);
