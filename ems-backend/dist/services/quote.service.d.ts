import { IQuote } from '../models/Quote.model';
export declare const QuoteService: {
    /**
     * Get the Quote of the Day.
     * Logic:
     * 1. Check if a quote is already set for today.
     * 2. If not, fetch a list from ZenQuotes.
     * 3. Filter for LONGER quotes (at least 120 chars) as requested.
     */
    getDailyQuote(): Promise<IQuote | null>;
    getAllQuotes(): Promise<IQuote[]>;
    createQuote(data: Partial<IQuote>): Promise<IQuote>;
    deleteQuote(id: string): Promise<void>;
};
//# sourceMappingURL=quote.service.d.ts.map