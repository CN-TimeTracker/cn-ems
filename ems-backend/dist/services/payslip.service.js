"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayslipService = void 0;
const Payslip_model_1 = __importDefault(require("../models/Payslip.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class PayslipService {
    /**
     * Admin uploads a payslip for a specific employee.
     * Maps employeeCode to a userId, then renames and stores the file.
     */
    async uploadPayslip(employeeCode, month, year, tempPath, adminId) {
        // 1. Find user by employeeCode
        const user = await User_model_1.default.findOne({ employeeCode });
        if (!user) {
            if (fs_1.default.existsSync(tempPath))
                fs_1.default.unlinkSync(tempPath);
            throw new Error(`Employee with code "${employeeCode}" not found`);
        }
        // 2. Check if a payslip already exists for this period — delete the old file if it does
        const existing = await Payslip_model_1.default.findOne({ userId: user._id, month, year });
        if (existing) {
            const oldPath = path_1.default.join(process.cwd(), existing.fileUrl);
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
            await Payslip_model_1.default.deleteOne({ _id: existing._id });
        }
        // 3. Define the final path and filename
        const filename = `payslip_${user._id}_${month}_${year}.pdf`;
        const finalRelativePath = path_1.default.join('uploads', 'payslips', filename);
        const finalFullPath = path_1.default.join(process.cwd(), finalRelativePath);
        // 4. Move (rename) the file from tempPath to finalPath
        fs_1.default.renameSync(tempPath, finalFullPath);
        // 5. Save the record in the database
        const payslip = await Payslip_model_1.default.create({
            userId: user._id,
            month,
            year,
            fileUrl: finalRelativePath.replace(/\\/g, '/'), // Force forward slashes for URLs
            filename,
            uploadedBy: adminId,
        });
        return payslip;
    }
    /**
     * Retrieves a payslip for a specific employee.
     */
    async getPayslip(userId, month, year) {
        return Payslip_model_1.default.findOne({ userId, month, year });
    }
    /**
     * Optional: Returns all payslips for a user (not requested but useful).
     */
    async getAllForUser(userId) {
        return Payslip_model_1.default.find({ userId }).sort({ year: -1, month: -1 });
    }
}
exports.PayslipService = PayslipService;
//# sourceMappingURL=payslip.service.js.map