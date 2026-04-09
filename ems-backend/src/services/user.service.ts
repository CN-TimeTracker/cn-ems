import User from '../models/User.model';
import {
  ICreateUserInput,
  IUpdateUserInput,
  IUserPublic,
  UserRole,
} from '../interfaces';

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────

const toPublic = (user: any): IUserPublic => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,

  employeeCode: user.employeeCode,
  username: user.username,
  phoneNumber: user.phoneNumber,
  dateOfJoining: user.dateOfJoining,
  dateOfBirth: user.dateOfBirth,
  gender: user.gender,
  fatherName: user.fatherName,
  currentAddress: user.currentAddress,
  permanentAddress: user.permanentAddress,
  description: user.description,

  salary: user.salary,
  bankName: user.bankName,
  accountNo: user.accountNo,
  branchName: user.branchName,
  ifscCode: user.ifscCode,
  aadharNo: user.aadharNo,
  panNo: user.panNo,

  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export class UserService {
  /**
   * Admin creates a new employee account.
   * The User model's pre-save hook hashes the password automatically.
   */
  async createUser(input: ICreateUserInput): Promise<IUserPublic> {
    const exists = await User.findOne({ email: input.email });
    if (exists) throw new Error('A user with this email already exists');

    const user = await User.create(input);
    return toPublic(user);
  }

  /**
   * Returns all users — sorted alphabetically by name.
   * Admin only; controller enforces role guard.
   */
  async getAllUsers(): Promise<IUserPublic[]> {
    const users = await User.find().sort({ name: 1 });
    return users.map(toPublic);
  }

  /**
   * Returns all active employees (non-admin) — used for task assignment dropdowns.
   */
  async getActiveEmployees(): Promise<IUserPublic[]> {
    const users = await User.find({ isActive: true }).sort({ name: 1 });
    return users.map(toPublic);
  }

  /**
   * Returns a single user by ID.
   */
  async getUserById(id: string): Promise<IUserPublic> {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return toPublic(user);
  }

  /**
   * Admin can update name, role, or active status.
   * Password changes have their own dedicated flow.
   */
  async updateUser(id: string, input: IUpdateUserInput): Promise<IUserPublic> {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    // Manually assign fields
    Object.assign(user, input);

    // .save() triggers the pre('save') hook for password hashing
    await user.save();
    
    return toPublic(user);
  }

  /**
   * Soft-delete: marks user inactive instead of removing from DB.
   * Preserves all historical logs and task assignments.
   */
  async deactivateUser(id: string): Promise<void> {
    const user = await User.findByIdAndUpdate(id, { isActive: false });
    if (!user) throw new Error('User not found');
  }

  /**
   * Reactivate user.
   */
  async activateUser(id: string): Promise<void> {
    const user = await User.findByIdAndUpdate(id, { isActive: true });
    if (!user) throw new Error('User not found');
  }
}
