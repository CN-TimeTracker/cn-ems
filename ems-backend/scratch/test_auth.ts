import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.model';

dotenv.config();

async function testAuth() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const email = 'testuser_' + Date.now() + '@example.com';
  const password = 'Password@123';

  console.log(`Creating user: ${email} with password: ${password}`);
  
  // 1. Create User
  const user = await User.create({
    name: 'Test User',
    email,
    password,
    role: 'Dev'
  });

  console.log('User created. Hashed password in DB:', user.password);
  
  // 2. Try to find and compare
  const foundUser = await User.findOne({ email }).select('+password');
  if (!foundUser) {
    console.error('User not found after creation!');
    return;
  }

  const isMatch = await foundUser.comparePassword(password);
  console.log('Password match result:', isMatch);

  // 3. Clean up
  await User.deleteOne({ _id: user._id });
  await mongoose.disconnect();
}

testAuth().catch(console.error);
