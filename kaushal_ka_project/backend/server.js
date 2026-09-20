import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'], // Match your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Basic route parsing
app.get('/', (req, res) => {
  res.send('Floveera Backend API instance is running');
});

// Port listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
