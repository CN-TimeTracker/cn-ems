"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const ProfileUpdateRequestSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    requestedChanges: {
        name: { type: String, trim: true },
        username: { type: String, trim: true },
        phoneNumber: { type: String, trim: true },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: Object.values(interfaces_1.Gender) },
        fatherName: { type: String, trim: true },
        currentAddress: { type: String, trim: true },
        permanentAddress: { type: String, trim: true },
        description: { type: String, trim: true },
    },
    status: {
        type: String,
        enum: Object.values(interfaces_1.ProfileUpdateRequestStatus),
        default: interfaces_1.ProfileUpdateRequestStatus.Pending,
    },
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// We can only have one pending request per user at a time
ProfileUpdateRequestSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { status: interfaces_1.ProfileUpdateRequestStatus.Pending } });
ProfileUpdateRequestSchema.index({ status: 1 });
const ProfileUpdateRequest = (0, mongoose_1.model)('ProfileUpdateRequest', ProfileUpdateRequestSchema);
exports.default = ProfileUpdateRequest;
//# sourceMappingURL=ProfileUpdateRequest.model.js.map