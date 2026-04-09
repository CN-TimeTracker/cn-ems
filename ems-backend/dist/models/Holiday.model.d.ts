import { Document } from 'mongoose';
export interface IHoliday extends Document {
    date: Date;
    name: string;
}
declare const Holiday: import("mongoose").Model<IHoliday, {}, {}, {}, Document<unknown, {}, IHoliday, {}, {}> & IHoliday & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Holiday;
//# sourceMappingURL=Holiday.model.d.ts.map