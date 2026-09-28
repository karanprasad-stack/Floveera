import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeFirstUserAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const Restaurant = (await import('./models/Restaurant.js')).default;
    const defaultRestaurant = await Restaurant.findOne({ status: 'ACTIVE' });

    // Upgrade all users in dev to admin & restaurant owner for seamless access
    const users = await User.find({});
    for (const u of users) {
      u.role = 'admin';
      u.restaurantRole = 'RESTAURANT_OWNER';
      if (defaultRestaurant) {
        u.restaurantId = defaultRestaurant._id;
      }
      await u.save();
      console.log(`Upgraded user "${u.name}" (${u.email}) to Admin & Restaurant Owner.`);
    }

    console.log(`\nSUCCESS! 🎉`);
    console.log(`All development users have been upgraded to Admin & Restaurant Owner!`);
    console.log(`You can now log in or refresh your browser to access the Restaurant CRM.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeFirstUserAdmin();
