'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '@/store/authSlice';
import { addToast } from '@/store/uiSlice';
import { useRouter } from 'next/navigation';

/**
 * Hook to automatically log out the user at 12:00 AM (Midnight)
 */
export const useMidnightLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      
      // Set to 12:00:00 AM the next day
      midnight.setHours(24, 0, 0, 0);
      
      return midnight.getTime() - now.getTime();
    };

    const triggerLogout = () => {
      dispatch(clearCredentials());
      dispatch(addToast({
        type: 'info',
        message: 'Your session has expired at midnight. Logging out...'
      }));
      router.push('/login');
      
      // Force a full reload to clear any remaining in-memory state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    const timeUntilMidnight = calculateTimeUntilMidnight();
    console.log(`[Session] Auto-logout scheduled in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes (at Midnight)`);

    // Set a timeout to trigger at exactly midnight
    const timeoutId = setTimeout(triggerLogout, timeUntilMidnight);

    // Also check periodically in case the computer wakes from sleep
    const intervalId = setInterval(() => {
      if (calculateTimeUntilMidnight() < 0) {
        triggerLogout();
      }
    }, 60000); // Check every minute

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [dispatch, router]);
};
