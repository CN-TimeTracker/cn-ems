"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const check = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        const User = mongoose_1.default.model('User', new mongoose_1.default.Schema({ email: String, password: { type: String, select: true } }, { collection: 'users' }));
        const user = await User.findOne({ email: 'admin@codeneptune.com' }).select('+password');
        if (user) {
            console.log('User found:', user.email);
            console.log('Password hash:', user.password);
            console.log('Is hashed (starts with $2):', user.password?.startsWith('$2'));
        }
        else {
            console.log('User admin@codeneptune.com NOT FOUND');
        }
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
};
check();
//# sourceMappingURL=check_db.js.map