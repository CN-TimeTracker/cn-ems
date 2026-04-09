"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const eventSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Brand',
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// ─────────────────────────────────────────────
// MODEL
// ─────────────────────────────────────────────
const Event = (0, mongoose_1.model)('Event', eventSchema);
exports.default = Event;
//# sourceMappingURL=event.model.js.map