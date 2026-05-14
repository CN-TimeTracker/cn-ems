declare class TimeServiceClass {
    private baseOnlineTimeMs;
    private basePerformanceTime;
    private isInitializing;
    init(): Promise<void>;
    /**
     * Get the current absolute time synced from the internet.
     * Returns a standard JS Date object.
     */
    now(): Date;
    /**
     * Get the current absolute time in milliseconds.
     */
    nowMs(): number;
}
export declare const TimeService: TimeServiceClass;
export {};
//# sourceMappingURL=time.service.d.ts.map