import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const email = process.argv[2];
    
    if (!email) {
      console.log('Please provide an email address as an argument.');
      console.log('Example: node makeAdmin.js user@example.com');
      process.exit(1);
    }

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Successfully updated ${email} to admin!`);
      console.log('User details:', { name: user.name, email: user.email, role: user.role });
    } else {
      console.log(`User with email ${email} not found.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
