import { AUTH_CONFIG } from '@/config/auth';

/**
 * Cross-tab session synchronization.
 * Triggers onLogout callback when token is cleared in any other browser tab.
 */
export const initCrossTabSync = (onLogout: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === AUTH_CONFIG.TOKEN_STORAGE_KEY && !event.newValue) {
      // Token cleared in another tab → log out immediately
      onLogout();
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
};

export default initCrossTabSync;
