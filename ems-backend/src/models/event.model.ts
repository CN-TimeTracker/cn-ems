import { Schema, model, Types, Document } from 'mongoose';

// ─────────────────────────────────────────────
// INTERFACE
// ─────────────────────────────────────────────

export interface IEvent extends Document {
  name: string;
  slug: string;
  info?: string;
  images: string[];
  brand?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────

const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Event slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    info: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// MODEL
// ─────────────────────────────────────────────

const Event = model<IEvent>('Event', eventSchema);

export default Event;