import { AUTH_CONFIG } from '../../../config/auth';

export const initCrossTabSync = (onLogout: () => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === AUTH_CONFIG.TOKEN_STORAGE_KEY && !event.newValue) {
      // Token cleared in another tab, log out instantly here
      onLogout();
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
};

export default initCrossTabSync;
