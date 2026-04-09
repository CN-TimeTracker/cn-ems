import { Schema, model, Document } from 'mongoose';

export interface IHoliday extends Document {
  date: Date;
  name: string;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    date: {
      type: Date,
      required: [true, 'Holiday date is required'],
      unique: true, // One holiday per date
    },
    name: {
      type: String,
      required: [true, 'Holiday name is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Model export

const Holiday = model<IHoliday>('Holiday', HolidaySchema);
export default Holiday;
