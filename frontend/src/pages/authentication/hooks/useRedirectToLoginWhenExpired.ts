import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { RoutePaths } from '../../../constants/route-paths';
import { useNotification } from '../../../hooks/useNotification';

// When a reset step's time is up: straight to the login page, with the reason as a toast there.
// The ref makes sure it happens once (React may run effects twice in development).
export const useRedirectToLoginWhenExpired = (isExpired: boolean, expiredMessage: string) => {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!isExpired || hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;

    showNotification(expiredMessage, 'warning');

    navigate(RoutePaths.LOGIN, { replace: true });
  }, [isExpired, expiredMessage, navigate, showNotification]);
};
