import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model';
import { UserService } from '../src/services/user.service';
import { AuthService } from '../src/services/auth.service';

dotenv.config();

const userService = new UserService();
const authService = new AuthService();

async function testUpdateHash() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const email = 'testupdate_' + Date.now() + '@example.com';
  const initialPassword = 'Initial_Password_123';
  const newPassword = 'New_Password_456';

  // 1. Create User
  console.log(`Creating user: ${email}`);
  const user = await userService.createUser({
    name: 'Test Update User',
    email,
    password: initialPassword,
    role: 'Dev' as any
  });

  // 2. Verify initial login works
  const login1 = await authService.login({ email, password: initialPassword });
  console.log('Initial login check:', !!login1.token ? 'SUCCESS' : 'FAILED');

  // 3. Update Password
  console.log('Updating password...');
  await userService.updateUser(user._id, { password: newPassword });

  // 4. Verify new password works
  try {
    const login2 = await authService.login({ email, password: newPassword });
    console.log('Update login check (New Password):', !!login2.token ? 'SUCCESS' : 'FAILED');
  } catch (err: any) {
    console.error('Update login check FAILED:', err.message);
  }

  // 5. Verify old password fails
  try {
    await authService.login({ email, password: initialPassword });
    console.log('Old password still works? (Bad!): YES');
  } catch (err) {
    console.log('Old password fails as expected: YES');
  }

  // Clean up
  await User.deleteOne({ _id: user._id });
  await mongoose.disconnect();
}

testUpdateHash().catch(console.error);
