class TimeServiceClass {
  private baseOnlineTimeMs: number | null = null;
  private basePerformanceTime: number | null = null;
  private isInitializing = false;

  public async init(): Promise<void> {
    if (this.baseOnlineTimeMs !== null || this.isInitializing) return;
    this.isInitializing = true;

    try {
      // Force native fetch or polyfill fetch to call external API
      const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC');
      if (!res.ok) throw new Error('Failed to fetch online time');
      const data = await res.json() as any;
      
      let dateObj: Date;
      if (data.dateTime && !data.dateTime.endsWith('Z')) {
        dateObj = new Date(data.dateTime + 'Z');
      } else if (data.dateTime) {
        dateObj = new Date(data.dateTime);
      } else {
        throw new Error("Invalid time format from API");
      }

      this.baseOnlineTimeMs = dateObj.getTime();
      this.basePerformanceTime = performance.now();
      console.log(`[TimeService] Synchronized backend time successfully with timeapi.io.`);
    } catch (error: any) {
      console.error(`[TimeService] Disconnected/Failed to fetch online time. Fallback to OS Time. Error: ${error.message}`);
      this.baseOnlineTimeMs = Date.now();
      this.basePerformanceTime = performance.now();
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Get the current absolute time synced from the internet.
   * Returns a standard JS Date object.
   */
  public now(): Date {
    if (this.baseOnlineTimeMs === null || this.basePerformanceTime === null) {
      return new Date(); // Fallback
    }
    const currentMs = this.baseOnlineTimeMs + (performance.now() - this.basePerformanceTime);
    return new Date(currentMs);
  }

  /**
   * Get the current absolute time in milliseconds.
   */
  public nowMs(): number {
    return this.now().getTime();
  }
}

export const TimeService = new TimeServiceClass();
