"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteController = void 0;
const quote_service_1 = require("../services/quote.service");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.QuoteController = {
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const quote = await quote_service_1.QuoteService.createQuote(req.body);
        res.status(201).json({
            success: true,
            data: quote,
        });
    }),
    getAll: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const quotes = await quote_service_1.QuoteService.getAllQuotes();
        res.status(200).json({
            success: true,
            data: quotes,
        });
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await quote_service_1.QuoteService.deleteQuote(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Quote deleted successfully',
        });
    }),
    getDaily: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const quote = await quote_service_1.QuoteService.getDailyQuote();
        res.status(200).json({
            success: true,
            data: quote,
        });
    }),
};
//# sourceMappingURL=quote.controller.js.map