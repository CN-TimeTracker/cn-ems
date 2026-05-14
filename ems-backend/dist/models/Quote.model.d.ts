import { Document } from 'mongoose';
export interface IQuote extends Document {
    text: string;
    author: string;
    lastShownDate: Date | null;
    isActive: boolean;
    createdAt: Date;
}
export declare const Quote: import("mongoose").Model<IQuote, {}, {}, {}, Document<unknown, {}, IQuote, {}, {}> & IQuote & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Quote.model.d.ts.map