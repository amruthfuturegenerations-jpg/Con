import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-lg bg-amber-600/95 border border-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-2xl backdrop-blur-md animate-pulse">
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span>Offline Mode — All site tasks & photos are saved securely on device.</span>
    </div>
  );
};
