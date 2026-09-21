import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import admin from '../firebase-config.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'floveera-super-secure-default-jwt-secret-key-2026';

// In-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map();

const rateLimitAuth = (maxAttempts = 5, windowMinutes = 15) => (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxAttempts) {
    const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
    return res.status(429).json({
      message: `Too many attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`
    });
  }

  record.count += 1;
  next();
};

const generateToken = (id, rememberMe = false) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '1d',
  });
};

const setTokenCookie = (res, token, rememberMe = false) => {
  const maxAge = rememberMe 
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000;      // 1 day

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge
  });
};

// @route   POST /api/auth/register
router.post('/register', rateLimitAuth(8, 15), async (req, res) => {
  try {
    const { name, email, phone, password, rememberMe } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      password // Handled via pre-save hook in Model
    });

    if (user) {
      const token = generateToken(user._id, rememberMe);
      setTokenCookie(res, token, rememberMe);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', rateLimitAuth(5, 15), async (req, res) => {
  try {
    const { email, identifier, password, rememberMe } = req.body;
    const loginTarget = (email || identifier || '').trim();

    if (!loginTarget || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { email: loginTarget.toLowerCase() },
        { phone: loginTarget }
      ]
    });

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id, rememberMe);
      setTokenCookie(res, token, rememberMe);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      });
    } else {
      // Secure generic message to prevent account enumeration
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.cookie('auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax'
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// Returns current logged in user based on HTTP-only cookie
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no session token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Session expired or invalid token' });
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', rateLimitAuth(5, 15), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Generate secure 32-byte cryptographic token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
      await user.save({ validateBeforeSave: false });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      console.log('\n======================================================');
      console.log(`[FLOVEERA AUTH] Password reset link for ${user.email}:`);
      console.log(resetUrl);
      console.log('======================================================\n');
    }

    // Always respond with a generic message for security
    res.json({
      message: 'If an account with that email exists, password reset instructions have been generated.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/reset-password
router.post('/reset-password', rateLimitAuth(5, 15), async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired' });
    }

    // Set new password (triggers bcrypt hashing in pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Your password has been successfully reset. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/firebase-login (Google OAuth)
router.post('/firebase-login', rateLimitAuth(10, 15), async (req, res) => {
  try {
    const { idToken, rememberMe } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    let email, name;

    // Verify Firebase token if admin is initialized
    if (admin && admin.auth) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      email = decodedToken.email;
      name = decodedToken.name;
    } else {
      // Fallback decode for development if Firebase Admin private key is not configured
      const payloadBase64 = idToken.split('.')[1];
      if (payloadBase64) {
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
        email = decoded.email;
        name = decoded.name || decoded.email?.split('@')[0];
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google OAuth' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: crypto.randomBytes(16).toString('hex'), // Random password for OAuth users
        role: 'user'
      });
    }

    const token = generateToken(user._id, rememberMe);
    setTokenCookie(res, token, rememberMe);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error('OAuth Login Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// @route   POST /api/auth/check-user-exists
router.post('/check-user-exists', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.json({ exists: false });

    const user = await User.findOne({ 
      $or: [
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() }
      ]
    });

    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
