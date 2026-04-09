"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const error_middleware_1 = require("../middleware/error.middleware");
// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
/** Signs a JWT for the given payload */
const signToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
/** Strips sensitive fields for client-safe response */
const toPublic = (user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
});
// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────
class AuthService {
    /**
     * Validates credentials and returns a signed JWT + public user object.
     * Throws a plain Error with a message on failure — controller decides HTTP status.
     */
    async login(input) {
        const { email, password } = input;
        // .select('+password') because password field has select:false on the schema
        const user = await User_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        }
        if (!user.isActive) {
            throw new error_middleware_1.AppError('Your account has been deactivated. Contact Admin.', 401);
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        }
        const payload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const token = signToken(payload);
        return { token, user: toPublic(user) };
    }
    /**
     * Returns the public profile of the currently authenticated user.
     */
    async getMe(userId) {
        const user = await User_model_1.default.findById(userId);
        if (!user)
            throw new Error('User not found');
        return toPublic(user);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map