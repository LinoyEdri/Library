import { useContext } from 'react';
import { NotificationContext } from '../context/notification-context';

// showNotification(message, severity). Must be used inside NotificationProvider.
export const useNotification = () => {
  const notificationContext = useContext(NotificationContext);

  if (!notificationContext) {
    throw new Error('useNotification must be used inside NotificationProvider');
  }

  return notificationContext;
};
