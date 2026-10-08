import { useNavigate } from 'react-router';
import { HebrewTexts } from '../../../constants/hebrew-texts';
import { RoutePaths } from '../../../constants/route-paths';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useNotification } from '../../../hooks/useNotification';

// After handing over the admin role this account is disabled: leave to the login page and say why
export const useEndSessionAfterAdminHandover = () => {
  const navigate = useNavigate();

  const { endSessionLocally } = useAuthentication();

  const { showNotification } = useNotification();

  return () => {
    endSessionLocally();

    navigate(RoutePaths.LOGIN, { replace: true });

    showNotification(HebrewTexts.users.adminHandedOver, 'info');
  };
};
