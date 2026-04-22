import { Request, Response } from 'express';
import { QuoteService } from '../services/quote.service';
import { asyncHandler } from '../utils/asyncHandler';

export const QuoteController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const quote = await QuoteService.createQuote(req.body);
    res.status(201).json({
      success: true,
      data: quote,
    });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const quotes = await QuoteService.getAllQuotes();
    res.status(200).json({
      success: true,
      data: quotes,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await QuoteService.deleteQuote(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Quote deleted successfully',
    });
  }),

  getDaily: asyncHandler(async (req: Request, res: Response) => {
    const quote = await QuoteService.getDailyQuote();
    res.status(200).json({
      success: true,
      data: quote,
    });
  }),
};
