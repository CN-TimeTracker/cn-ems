"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Excluded from queries by default — must opt-in with .select('+password')
    },
    role: {
        type: String,
        enum: Object.values(interfaces_1.UserRole),
        default: interfaces_1.UserRole.Dev,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // ── Employee General Details ──
    employeeCode: { type: String, trim: true },
    username: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    dateOfJoining: { type: Date },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    fatherName: { type: String, trim: true },
    currentAddress: { type: String, trim: true },
    permanentAddress: { type: String, trim: true },
    description: { type: String, trim: true },
    // ── Account Details (Sensitive) ──
    salary: { type: Number },
    bankName: { type: String, trim: true },
    accountNo: { type: String, trim: true },
    branchName: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    aadharNo: { type: String, trim: true },
    panNo: { type: String, trim: true },
}, {
    timestamps: true, // auto-manages createdAt / updatedAt
    versionKey: false,
    toJSON: {
        // Strip password from any JSON serialization even if accidentally selected
        transform: (_doc, ret) => {
            // Use undefined assignment instead of delete — avoids TS2790 strict-mode error
            ret.password = undefined;
            return ret;
        },
    },
});
// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
// Hash password before every save — only if it was modified
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcryptjs_1.default.genSalt(12);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
// ─────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────
const User = (0, mongoose_1.model)('User', UserSchema);
exports.default = User;
//# sourceMappingURL=User.model.js.map