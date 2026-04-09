'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerState {
  seconds: number;
  isActive: boolean;
  isPaused: boolean;
}

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    seconds: 0,
    isActive: false,
    isPaused: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: true, isPaused: false }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const setSeconds = useCallback((s: number) => {
    setState((prev) => ({ ...prev, seconds: s }));
  }, []);

  const stop = useCallback(() => {
    const finalSeconds = state.seconds;
    setState({ seconds: 0, isActive: false, isPaused: false });
    if (intervalRef.current) clearInterval(intervalRef.current);
    return finalSeconds;
  }, [state.seconds]);

  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isActive, state.isPaused]);

  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  };

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    setSeconds,
    formatDuration,
  };
}
