import api from '../lib/api';
import { ApiResponse, Quote, CreateQuoteInput } from '../types';

const QuoteService = {
  /**
   * Admin: Get all quotes
   */
  getAllQuotes: async (): Promise<Quote[]> => {
    const { data } = await api.get<ApiResponse<Quote[]>>('/quotes');
    return data.data;
  },

  /**
   * Admin: Create a new quote
   */
  createQuote: async (input: CreateQuoteInput): Promise<Quote> => {
    const { data } = await api.post<ApiResponse<Quote>>('/quotes', input);
    return data.data;
  },

  /**
   * Admin: Delete a quote
   */
  deleteQuote: async (id: string): Promise<void> => {
    await api.delete(`/quotes/${id}`);
  },

  /**
   * User/Public: Get the daily quote
   */
  getDailyQuote: async (): Promise<Quote | null> => {
    const { data } = await api.get<ApiResponse<Quote | null>>('/quotes/daily');
    return data.data;
  },
};

export default QuoteService;
