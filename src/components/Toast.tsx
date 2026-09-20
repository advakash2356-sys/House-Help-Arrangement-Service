import React, { useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'new_booking' | 'capacity_alert';
  title: string;
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  timestamp?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const playNotificationChime = (
  type: 'booking' | 'alert' | 'success' | 'warn' | 'error' | 'info' = 'info'
) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'booking') {
      // Pleasant upward two-tone chime (E5 -> G5)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'alert' || type === 'warn') {
      // Capacity warning chime (triad pulse)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.12);
      osc.frequency.setValueAtTime(659.25, now + 0.24);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'error') {
      // Downward error tone
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(329.63, now);
      osc.frequency.setValueAtTime(261.63, now + 0.15);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Gentle confirmation blip (success/info)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
};

export const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 6000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'new_booking':
        return {
          bg: 'bg-slate-900 border-amber-400/50 text-white shadow-xl',
          icon: <Bell className="w-5 h-5 text-amber-400 animate-bounce shrink-0 mt-0.5" />,
          badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
          badgeText: 'New Arrangement',
          progressBar: 'bg-amber-400',
        };
      case 'capacity_alert':
        return {
          bg: 'bg-rose-950 border-rose-500 text-white shadow-2xl ring-2 ring-rose-500/30',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />,
          badge: 'bg-rose-500/30 text-rose-200 border-rose-400/40',
          badgeText: '15 Cap Enforced',
          progressBar: 'bg-rose-500',
        };
      case 'success':
        return {
          bg: 'bg-white border-emerald-300 text-slate-900 shadow-lg',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          badgeText: 'Success',
          progressBar: 'bg-emerald-500',
        };
      case 'warn':
        return {
          bg: 'bg-white border-amber-300 text-slate-900 shadow-lg',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          badgeText: 'Notice',
          progressBar: 'bg-amber-500',
        };
      case 'error':
        return {
          bg: 'bg-white border-rose-300 text-slate-900 shadow-lg',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          badgeText: 'Error',
          progressBar: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-white border-slate-200 text-slate-900 shadow-lg',
          icon: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          badgeText: 'Info',
          progressBar: 'bg-sky-500',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      id={`toast-${toast.id}`}
      className={`relative w-84 sm:w-96 rounded-2xl border p-4 transition-all duration-200 overflow-hidden ${style.bg}`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {style.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${style.badge}`}
              >
                {style.badgeText}
              </span>
              <span className="text-[10px] opacity-60">
                {toast.timestamp || new Date().toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="opacity-60 hover:opacity-100 p-1 rounded-md transition-opacity cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
          <p className="text-[11px] opacity-80 mt-1 leading-snug">{toast.message}</p>

          {toast.actionLabel && toast.onAction && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  toast.onAction?.();
                  onDismiss(toast.id);
                }}
                className="text-xs font-bold inline-flex items-center space-x-1 underline hover:no-underline cursor-pointer"
              >
                <span>{toast.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={`h-full transition-all duration-75 ease-linear ${style.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="admin-toast-container"
      className="fixed top-4 right-4 z-50 flex flex-col space-y-3 pointer-events-auto max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
