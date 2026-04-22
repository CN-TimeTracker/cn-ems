import { Quote, IQuote } from '../models/Quote.model';
import { AppError } from '../middleware/error.middleware';

export const QuoteService = {
  /**
   * Get the Quote of the Day.
   * Logic: 
   * 1. Check if a quote is already set for today.
   * 2. If not, fetch a list from ZenQuotes.
   * 3. Filter for LONGER quotes (at least 120 chars) as requested.
   */
  async getDailyQuote(): Promise<IQuote | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find if a quote is already set for today
    let dailyQuote = await Quote.findOne({
      lastShownDate: { $gte: today },
      isActive: true
    });

    if (dailyQuote) return dailyQuote;

    // 2. Fetch from ZenQuotes API (using /api/quotes for a list of 50)
    try {
      const response = await fetch('https://zenquotes.io/api/quotes');
      
      if (!response.ok) {
        throw new Error(`ZenQuotes API error: ${response.statusText}`);
      }

      const data = await response.json() as any[];
      
      if (data && data.length > 0) {
        // FILTER: Keep quotes between 120 and 300 characters for "1.5 to 2 lines"
        let longQuotes = data.filter(q => q.q.length >= 120);
        
        // If no long quotes in this batch, take the longest one available
        if (longQuotes.length === 0) {
          longQuotes = [data.reduce((a, b) => a.q.length > b.q.length ? a : b)];
        }

        // Pick a random one from the long set
        const selected = longQuotes[Math.floor(Math.random() * longQuotes.length)];
        
        // Save to DB to cache for today
        const newQuote = await Quote.create({
          text: selected.q,
          author: selected.a || 'Unknown',
          lastShownDate: new Date(),
          isActive: true
        });

        return newQuote;
      }
    } catch (error) {
      console.error('Failed to fetch quote from ZenQuotes:', error);
    }

    // 3. Fallback: Return a high-quality long default quote if API fails
    const fallbackQuotes = [
      {
        text: "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith, knowing that the future is built by those who believe in the beauty of their dreams.",
        author: "Franklin D. Roosevelt",
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts. It is during our darkest moments that we must focus to see the light and keep pushing toward our ultimate goals.",
        author: "Winston Churchill",
      }
    ];

    const selectedFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    
    const fallbackDb = {
      ...selectedFallback,
      lastShownDate: new Date(),
      isActive: true
    } as any;

    try {
      return await Quote.create(fallbackDb);
    } catch (e) {
      return fallbackDb;
    }
  },

  async getAllQuotes(): Promise<IQuote[]> {
    return Quote.find().sort({ createdAt: -1 });
  },

  async createQuote(data: Partial<IQuote>): Promise<IQuote> {
    return Quote.create(data);
  },

  async deleteQuote(id: string): Promise<void> {
    const quote = await Quote.findById(id);
    if (!quote) throw new AppError('Quote not found', 404);
    await Quote.findByIdAndDelete(id);
  }
};
