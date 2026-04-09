import { IPayslip } from '../interfaces';
export declare class PayslipService {
    /**
     * Admin uploads a payslip for a specific employee.
     * Maps employeeCode to a userId, then renames and stores the file.
     */
    uploadPayslip(employeeCode: string, month: number, year: number, tempPath: string, adminId: string): Promise<IPayslip>;
    /**
     * Retrieves a payslip for a specific employee.
     */
    getPayslip(userId: string, month: number, year: number): Promise<IPayslip | null>;
    /**
     * Optional: Returns all payslips for a user (not requested but useful).
     */
    getAllForUser(userId: string): Promise<IPayslip[]>;
}
//# sourceMappingURL=payslip.service.d.ts.map