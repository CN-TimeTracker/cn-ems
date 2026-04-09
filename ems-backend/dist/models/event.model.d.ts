import { Types, Document } from 'mongoose';
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
declare const Event: import("mongoose").Model<IEvent, {}, {}, {}, Document<unknown, {}, IEvent, {}, {}> & IEvent & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Event;
//# sourceMappingURL=event.model.d.ts.map