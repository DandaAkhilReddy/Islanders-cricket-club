import { useState, useEffect } from 'react';
import { logger } from '../services/logger';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to detect online/offline status
 * Returns current online status and whether the user was offline
 */
export function useOfflineDetection(): OfflineState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      logger.info('Network connection restored', undefined, 'NETWORK');
      setIsOnline(true);
      setWasOffline(true);

      // Reset wasOffline after 5 seconds
      setTimeout(() => {
        setWasOffline(false);
      }, 5000);
    };

    const handleOffline = () => {
      logger.warn('Network connection lost', undefined, 'NETWORK');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
