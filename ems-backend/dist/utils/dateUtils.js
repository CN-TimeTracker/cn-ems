"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IST_OFFSET_MS = void 0;
exports.getISTMidnight = getISTMidnight;
/**
 * Office hours and date tracking in GST/IST (UTC+5:30)
 */
exports.IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
/**
 * Returns a Date object representing the midnight (00:00:00) of the current IST day,
 * but expressed in UTC.
 *
 * Example:
 * If it's April 9th 2:00 AM IST, this returns a UTC Date that corresponds to April 9th 00:00 IST.
 * (Which is April 8th 18:30 UTC).
 */
function getISTMidnight(date = new Date()) {
    // 1. Shift current time to IST
    const nowIST = new Date(date.getTime() + exports.IST_OFFSET_MS);
    // 2. Clear hours in IST
    const midnightIST = new Date(nowIST);
    midnightIST.setUTCHours(0, 0, 0, 0);
    // 3. Shift back to UTC
    return new Date(midnightIST.getTime() - exports.IST_OFFSET_MS);
}
//# sourceMappingURL=dateUtils.js.map