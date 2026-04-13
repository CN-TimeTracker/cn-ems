let baseOnlineTimeMs: number | null = null;
let basePerformanceTime: number | null = null;
let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initializes and synchronizes the time with the online server.
 */
export async function syncOnlineTime(): Promise<void> {
  if (baseOnlineTimeMs !== null) return;
  if (isInitializing && initializationPromise) return initializationPromise;

  isInitializing = true;
  initializationPromise = (async () => {
    try {
      const res = await fetch('/api/time');
      const data = await res.json();
      
      let dateObj: Date;
      if (data.dateTime && !data.dateTime.endsWith('Z')) {
        // timeapi.io returns UTC time without a Z when requesting UTC zone, we append it to parse properly
        dateObj = new Date(data.dateTime + 'Z');
      } else if (data.dateTime) {
        dateObj = new Date(data.dateTime);
      } else {
        throw new Error("Invalid time data");
      }
      
      baseOnlineTimeMs = dateObj.getTime();
      basePerformanceTime = performance.now();
    } catch (error) {
      console.error('[OnlineTime] Failed to fetch true time, falling back to local time.', error);
      baseOnlineTimeMs = Date.now();
      basePerformanceTime = performance.now();
    } finally {
      isInitializing = false;
    }
  })();

  return initializationPromise;
}

/**
 * Gets the current absolute time in milliseconds.
 * Impervious to local OS clock changes after sync.
 */
export function getOnlineTimeMs(): number {
  if (baseOnlineTimeMs === null || basePerformanceTime === null) {
    return Date.now(); // Fallback if not initialized
  }
  return baseOnlineTimeMs + (performance.now() - basePerformanceTime);
}

/**
 * Synchronous check to trace if time has been synced.
 */
export function isOnlineTimeSynced(): boolean {
  return baseOnlineTimeMs !== null;
}
