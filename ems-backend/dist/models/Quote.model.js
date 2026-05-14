"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quote = void 0;
const mongoose_1 = require("mongoose");
const quoteSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: [true, 'Quote text is required'],
        trim: true,
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true,
    },
    lastShownDate: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
exports.Quote = (0, mongoose_1.model)('Quote', quoteSchema);
//# sourceMappingURL=Quote.model.js.map