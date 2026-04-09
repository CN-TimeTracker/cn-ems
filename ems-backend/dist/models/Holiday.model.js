"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HolidaySchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    versionKey: false,
});
// Model export
const Holiday = (0, mongoose_1.model)('Holiday', HolidaySchema);
exports.default = Holiday;
//# sourceMappingURL=Holiday.model.js.map