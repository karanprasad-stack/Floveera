import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeFirstUserAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Find the most recently created user
    const user = await User.findOne().sort({ createdAt: -1 });
    
    if (!user) {
      console.log('No users found in the database. Please go to your website and Sign Up first.');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`\nSUCCESS! 🎉`);
    console.log(`The user "${user.name}" (${user.email}) has been upgraded to an ADMIN!`);
    console.log(`You can now log in to the website with this account to see the Admin Dashboard.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeFirstUserAdmin();
