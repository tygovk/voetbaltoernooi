import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, RotateCcw, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
  undoLabel?: string;
  duration?: number;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration ?? 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const type = toast.type || 'info';

  const bgColor =
    type === 'success'
      ? 'bg-emerald-950/95 border-emerald-600/70 text-emerald-100 shadow-emerald-950/50'
      : type === 'warning'
      ? 'bg-amber-950/95 border-amber-600/70 text-amber-100 shadow-amber-950/50'
      : type === 'error'
      ? 'bg-rose-950/95 border-rose-600/70 text-rose-100 shadow-rose-950/50'
      : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/60';

  const icon =
    type === 'success' ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
    ) : type === 'warning' ? (
      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
    ) : type === 'error' ? (
      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
    ) : (
      <Info className="w-4 h-4 text-sky-400 shrink-0" />
    );

  return (
    <div
      id="app-toast-notification"
      className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${bgColor}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon}
          <p className="text-xs sm:text-sm font-medium leading-snug truncate">
            {toast.message}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {toast.undoAction && (
            <button
              id="btn-toast-undo"
              type="button"
              onClick={() => {
                toast.undoAction?.();
                onDismiss();
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{toast.undoLabel || 'Herstel'}</span>
            </button>
          )}

          <button
            id="btn-toast-dismiss"
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
