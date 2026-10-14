import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initSocketServer } from './socket.js';

import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Ensure uploads/menu directory exists for persistent food photo storage
const uploadsDir = path.join(process.cwd(), 'uploads', 'menu');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

// Direct / Fallback routes (when clients or reverse proxies call without /api prefix)
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/user', userRoutes);
app.use('/orders', orderRoutes);
app.use('/restaurants', restaurantCrmRoutes);
app.use('/api/me', (req, res, next) => {
  req.url = '/me';
  authRoutes(req, res, next);
});

// Basic route parsing
app.get('/', (req, res) => {
  res.send('Floveera Backend API instance is running');
});

// Initialize Real-Time Presence Socket.IO Server
initSocketServer(httpServer, allowedOrigins);

// Port listening
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (HTTP & Socket.IO Presence Enabled)`);
});
