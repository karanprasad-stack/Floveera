import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration supporting both Customer Website & Restaurant CRM
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.CUSTOMER_APP_URL || 'https://floveera.com',
  process.env.CRM_APP_URL || 'https://crm.floveera.com'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import userRoutes from './routes/user.js';
import orderRoutes from './routes/orders.js';
import restaurantCrmRoutes from './routes/restaurantCrm.js';
import { getOrCreateDefaultRestaurant } from './utils/restaurantHelper.js';

import User from './models/User.js';

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/floveera';
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    try {
      await User.syncIndexes();
      console.log('User indexes synchronized successfully');
    } catch (idxErr) {
      console.warn('Index sync note:', idxErr.message);
    }
    await getOrCreateDefaultRestaurant().catch(e => console.error('Error initializing default restaurant:', e));
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantCrmRoutes);

// Basic route parsing
app.get('/', (req, res) => {
  res.send('Floveera Backend API instance is running');
});

// Port listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
