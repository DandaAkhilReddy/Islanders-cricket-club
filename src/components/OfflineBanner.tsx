import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineDetection } from '../hooks/useOfflineDetection';

export default function OfflineBanner() {
  const { isOnline, wasOffline } = useOfflineDetection();

  // Show banner when offline
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg">
        <WifiOff className="w-5 h-5" />
        <span className="font-semibold">You are offline</span>
        <span className="text-sm opacity-90">Some features may not be available</span>
      </div>
    );
  }

  // Show success banner briefly when coming back online
  if (wasOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
        <Wifi className="w-5 h-5" />
        <span className="font-semibold">Back online</span>
      </div>
    );
  }

  return null;
}
