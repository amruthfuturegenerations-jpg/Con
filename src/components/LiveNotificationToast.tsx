import React from 'react';
import { Radio, X, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { LiveNotification } from '../types';

interface LiveNotificationToastProps {
  notifications: LiveNotification[];
  onDismiss: (id: string) => void;
}

export const LiveNotificationToast: React.FC<LiveNotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-auto">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white border border-amber-300 text-slate-800 shadow-xl animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start gap-2.5 overflow-hidden">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <Radio className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">{notif.sender}</span>
                <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(notif.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
