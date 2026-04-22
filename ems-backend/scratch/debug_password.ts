import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model';
import bcrypt from 'bcryptjs';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected');

  const email = 'admin@codeneptune.com';
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }

  console.log('User found:', user.name);
  
  // 1. Verify current password works
  const currentPassInDB = user.password;
  console.log('Current hash in DB:', currentPassInDB);
  const isMatchCurrent = await user.comparePassword('admin123');
  console.log('Verify "admin123" matches:', isMatchCurrent);

  if (!isMatchCurrent) {
      console.log('Error: Initial password does not match. Seed might have changed.');
      // Update it to known value for test consistency if needed, but let's see.
  }

  // 2. Perform Update
  const newPass = 'final_test_pass_123';
  console.log('Updating password to:', newPass);
  user.password = newPass;
  user.markModified('password');
  await user.save();
  console.log('User saved.');

  // 3. Verify
  const updatedUser = await User.findOne({ email }).select('+password');
  console.log('Updated hash in DB:', updatedUser?.password);
  
  const isMatchNew = await updatedUser?.comparePassword(newPass);
  const isMatchOld = await updatedUser?.comparePassword('admin123');

  console.log('Match with NEW password:', isMatchNew);
  console.log('Match with OLD password (should be false):', isMatchOld);

  if (isMatchNew && !isMatchOld) {
    console.log('SUCCESS: Password rotation logic verified.');
  } else {
    console.log('FAILURE: Password update logic is still not working as expected.');
  }

  await mongoose.disconnect();
}

test();
