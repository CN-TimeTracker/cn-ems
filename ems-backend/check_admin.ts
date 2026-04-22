import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model';
import bcrypt from 'bcryptjs';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const user = await User.findOne({ email: 'admin@codeneptune.com' }).select('+password');
  if (!user) {
    console.log('User not found!');
  } else {
    console.log('User found:', user.email);
    console.log('Password hash:', user.password);
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Password match:', isMatch);
  }
  process.exit(0);
};

run().catch(console.error);
