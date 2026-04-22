import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import {
  ILoginInput,
  ILoginResult,
  ICreateUserInput,
  IUserPublic,
  IJwtPayload,
} from '../interfaces';
import { AppError } from '../middleware/error.middleware';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Signs a JWT for the given payload */
const signToken = (payload: IJwtPayload): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/** Strips sensitive fields for client-safe response */
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

export class AuthService {
  /**
   * Validates credentials and returns a signed JWT + public user object.
   * Throws a plain Error with a message on failure — controller decides HTTP status.
   */
  async login(input: ILoginInput): Promise<ILoginResult> {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    // .select('+password') because password field has select:false on the schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact Admin.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload: IJwtPayload = {
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
  async getMe(userId: string): Promise<IUserPublic> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return toPublic(user);
  }

  /**
   * Updates the password of the currently authenticated user.
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('enter the correct current password', 400);
    }

    user.password = newPassword;
    user.markModified('password');
    await user.save();
  }
}
