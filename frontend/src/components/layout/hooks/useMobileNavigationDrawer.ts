import { useCallback, useState } from 'react';

// Open/closed state of the side menu on small screens
export const useMobileNavigationDrawer = () => {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  const toggleMobileNavigation = useCallback(
    () => setIsMobileNavigationOpen((isOpen) => !isOpen),
    [],
  );

  const closeMobileNavigation = useCallback(() => setIsMobileNavigationOpen(false), []);

  return {
    isMobileNavigationOpen,
    toggleMobileNavigation,
    closeMobileNavigation,
  };
};
