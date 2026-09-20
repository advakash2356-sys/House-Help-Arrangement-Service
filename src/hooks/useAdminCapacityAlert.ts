import { useEffect, useRef } from 'react';
import { ToastMessage, playNotificationChime } from '../components/Toast';

interface UseAdminCapacityAlertOptions {
  dailyCount: number;
  maxLimit?: number;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  onNavigateToAdmin?: () => void;
  enabled?: boolean;
}

/**
 * Custom Hook: useAdminCapacityAlert
 * Automatically monitors daily bookings count against the 15-booking threshold.
 * Pushes high-priority toast alerts, sound chimes, and haptic vibration to the admin
 * whenever the daily capacity threshold is reached or exceeded.
 */
export function useAdminCapacityAlert({
  dailyCount,
  maxLimit = 15,
  addToast,
  onNavigateToAdmin,
  enabled = true,
}: UseAdminCapacityAlertOptions) {
  const previousCountRef = useRef<number | null>(null);
  const hasAlertedForTodayCapRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    const prev = previousCountRef.current;
    const threshold = maxLimit;

    // Trigger alert if count just crossed or reached the 15 threshold
    const reachedThreshold = dailyCount >= threshold;
    const wasBelowThreshold = prev === null ? false : prev < threshold;

    if (reachedThreshold && (wasBelowThreshold || (!hasAlertedForTodayCapRef.current && prev !== null))) {
      hasAlertedForTodayCapRef.current = true;

      // Audio warning chime
      playNotificationChime('alert');

      // Haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([80, 50, 80, 50, 120]);
        } catch {
          // ignore if vibration blocked
        }
      }

      // High-priority toast alert
      addToast({
        type: 'capacity_alert',
        title: `⚠️ Daily Hard Cap Reached (${dailyCount}/${threshold})!`,
        message:
          'Daily maximum limit of 15 bookings reached. The platform has automatically transitioned to clean Referral Mode to prevent unfulfillable orders and dispatch delays.',
        actionLabel: 'Open Admin Dashboard',
        onAction: () => {
          if (onNavigateToAdmin) {
            onNavigateToAdmin();
          }
        },
        duration: 10000,
      });
    }

    // Reset alert trigger if count is lowered below threshold (e.g. by admin reset)
    if (dailyCount < threshold) {
      hasAlertedForTodayCapRef.current = false;
    }

    previousCountRef.current = dailyCount;
  }, [dailyCount, maxLimit, enabled, addToast, onNavigateToAdmin]);

  return {
    isCapReached: dailyCount >= maxLimit,
    remainingSlots: Math.max(0, maxLimit - dailyCount),
    utilizationRate: Math.min(100, Math.round((dailyCount / maxLimit) * 100)),
  };
}
