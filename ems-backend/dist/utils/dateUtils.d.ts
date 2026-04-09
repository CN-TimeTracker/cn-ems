/**
 * Office hours and date tracking in GST/IST (UTC+5:30)
 */
export declare const IST_OFFSET_MS: number;
/**
 * Returns a Date object representing the midnight (00:00:00) of the current IST day,
 * but expressed in UTC.
 *
 * Example:
 * If it's April 9th 2:00 AM IST, this returns a UTC Date that corresponds to April 9th 00:00 IST.
 * (Which is April 8th 18:30 UTC).
 */
export declare function getISTMidnight(date?: Date): Date;
//# sourceMappingURL=dateUtils.d.ts.map