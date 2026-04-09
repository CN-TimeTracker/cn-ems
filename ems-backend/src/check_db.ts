import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const User = mongoose.model('User', new mongoose.Schema({ email: String, password: { type: String, select: true } }, { collection: 'users' }));
        const user = await User.findOne({ email: 'admin@codeneptune.com' }).select('+password');
        
        if (user) {
            console.log('User found:', user.email);
            console.log('Password hash:', user.password);
            console.log('Is hashed (starts with $2):', user.password?.startsWith('$2'));
        } else {
            console.log('User admin@codeneptune.com NOT FOUND');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

check();
