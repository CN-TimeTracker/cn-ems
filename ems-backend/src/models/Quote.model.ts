import { Schema, model, Document } from 'mongoose';

export interface IQuote extends Document {
  text: string;
  author: string;
  lastShownDate: Date | null;
  isActive: boolean;
  createdAt: Date;
}

const quoteSchema = new Schema<IQuote>({
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

export const Quote = model<IQuote>('Quote', quoteSchema);
