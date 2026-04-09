import { ICreateUserInput, IUpdateUserInput, IUserPublic } from '../interfaces';
export declare class UserService {
    /**
     * Admin creates a new employee account.
     * The User model's pre-save hook hashes the password automatically.
     */
    createUser(input: ICreateUserInput): Promise<IUserPublic>;
    /**
     * Returns all users — sorted alphabetically by name.
     * Admin only; controller enforces role guard.
     */
    getAllUsers(): Promise<IUserPublic[]>;
    /**
     * Returns all active employees (non-admin) — used for task assignment dropdowns.
     */
    getActiveEmployees(): Promise<IUserPublic[]>;
    /**
     * Returns a single user by ID.
     */
    getUserById(id: string): Promise<IUserPublic>;
    /**
     * Admin can update name, role, or active status.
     * Password changes have their own dedicated flow.
     */
    updateUser(id: string, input: IUpdateUserInput): Promise<IUserPublic>;
    /**
     * Soft-delete: marks user inactive instead of removing from DB.
     * Preserves all historical logs and task assignments.
     */
    deactivateUser(id: string): Promise<void>;
    /**
     * Reactivate user.
     */
    activateUser(id: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map