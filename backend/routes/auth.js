import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import EmployeeInvitation from '../models/EmployeeInvitation.js';
import AuditLog from '../models/AuditLog.js';
import admin from '../firebase-config.js';
import { normalizeRestaurantRole } from '../middleware/restaurantAuth.js';
import { getUserPermissions } from '../utils/permissions.js';
import Restaurant from '../models/Restaurant.js';
import { 
  normalizePhoneNumber,
  isEmailIdentifier,
  getPhoneSearchVariants
} from '../utils/employeeHelper.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'floveera-super-secure-default-jwt-secret-key-2026';

// In-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map();

const rateLimitAuth = (maxAttempts = 5, windowMinutes = 15) => (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
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
    path: '/',
    maxAge
  });
};

const setCrmTokenCookie = (res, token, rememberMe = false) => {
  const maxAge = rememberMe 
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000;      // 1 day

  res.cookie('crm_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
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
        role: user.role,
        restaurantRole: user.restaurantRole,
        restaurantId: user.restaurantId
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
    sameSite: 'lax',
    path: '/'
  });
  res.cookie('crm_auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    path: '/'
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @route   POST /api/auth/crm-logout
router.post('/crm-logout', (req, res) => {
  res.cookie('crm_auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    path: '/'
  });
  res.status(200).json({ message: 'CRM session logged out successfully' });
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
    const { email, identifier, phone } = req.body;
    const target = (identifier || email || phone || '').trim();
    if (!target) {
      return res.status(400).json({ message: 'Email or mobile number is required' });
    }

    let user = null;
    if (isEmailIdentifier(target)) {
      user = await User.findOne({ email: target.toLowerCase() });
    } else {
      const phoneVariants = getPhoneSearchVariants(target);
      user = await User.findOne({ phone: { $in: phoneVariants } });
    }

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
      console.log(`[FLOVEERA AUTH] Password reset link for ${user.email || user.phone}:`);
      console.log(resetUrl);
      console.log('======================================================\n');
    }

    // Always respond with a generic message for security
    res.json({
      message: 'If an account matching those details exists, password reset instructions have been generated.'
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

    if (!user.restaurantRole || user.role !== 'admin' || !user.restaurantId) {
      try {
        const { getOrCreateDefaultRestaurant } = await import('../utils/restaurantHelper.js');
        const r = await getOrCreateDefaultRestaurant();
        user.role = 'admin';
        user.restaurantRole = 'RESTAURANT_OWNER';
        user.restaurantId = r._id;
        await user.save();
      } catch (e) {
        console.error('Error attaching restaurant on firebase login:', e);
      }
    }

    const token = generateToken(user._id, rememberMe);
    setTokenCookie(res, token, rememberMe);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      restaurantRole: user.restaurantRole,
      restaurantId: user.restaurantId
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

// @route   POST /api/auth/restaurant/register
// @desc    Register a new Restaurant Employee using an Admin-issued Registration Code
router.post('/restaurant/register', rateLimitAuth(8, 15), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      registrationCode,
      registrationToken
    } = req.body;

    const rawCode = (registrationCode || registrationToken || '').trim().toUpperCase();

    // 1. Basic Required Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Mobile number is required.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone || normalizedPhone.replace(/[^\d]/g, '').length < 10) {
      return res.status(400).json({ message: 'Please provide a valid mobile number (at least 10 digits).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // 2. Email Validation (Optional field - never generate fake emails)
    let normalizedEmail = undefined;
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = email.toLowerCase().trim();
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
      }
      normalizedEmail = cleanEmail;
    }

    // 3. Security: Validate Registration / Invitation Code (Optional for direct employee onboarding)
    let invitation = null;
    let restaurant = null;
    let autoApprove = true;

    if (rawCode) {
      invitation = await EmployeeInvitation.findOne({ code: rawCode });
      if (!invitation) {
        return res.status(400).json({ message: 'Invalid or expired registration code.' });
      }

      if (invitation.status !== 'ACTIVE') {
        return res.status(400).json({ message: 'Invalid or expired registration code.' });
      }

      if (new Date(invitation.expiresAt) < new Date()) {
        invitation.status = 'EXPIRED';
        await invitation.save();
        return res.status(400).json({ message: 'Invalid or expired registration code.' });
      }

      if (invitation.usedCount >= invitation.maxUses) {
        invitation.status = 'USED';
        await invitation.save();
        return res.status(400).json({ message: 'This registration code has already been used.' });
      }

      if (invitation.email) {
        if (!normalizedEmail || invitation.email.toLowerCase() !== normalizedEmail) {
          return res.status(400).json({
            message: 'This registration code was issued for a different email address.'
          });
        }
      }

      restaurant = await Restaurant.findById(invitation.restaurantId);
      autoApprove = invitation.autoApprove !== false;
    } else {
      // Direct registration without code assigns to default active restaurant
      const { getOrCreateDefaultRestaurant } = await import('../utils/restaurantHelper.js');
      restaurant = await getOrCreateDefaultRestaurant();
      autoApprove = true;
    }

    if (!restaurant || restaurant.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'The restaurant associated with this registration is not active.' });
    }

    // 4. Prevent Duplicate Accounts
    if (normalizedEmail) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'This email address is already registered.' });
      }
    }

    const phoneVariants = getPhoneSearchVariants(phone);
    const existingPhone = await User.findOne({ 
      phone: { $in: [normalizedPhone, ...phoneVariants] } 
    });
    if (existingPhone) {
      return res.status(400).json({ message: 'This mobile number is already registered.' });
    }

    // 5. Security: Explicit Role Assignment (Never allow RESTAURANT_ADMIN creation)
    const finalRole = autoApprove ? 'RESTAURANT_WORKER' : 'PENDING_EMPLOYEE';
    const finalStatus = autoApprove ? 'ACTIVE' : 'PENDING';

    const newWorker = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password, // Bcrypt hashed via User model pre-save hook
      role: 'user', // Never system admin
      restaurantRole: finalRole,
      status: finalStatus,
      restaurantId: restaurant._id
    });

    // 6. Update Invitation Tracking if code was used
    if (invitation) {
      invitation.usedCount += 1;
      invitation.usedBy.push({
        userId: newWorker._id,
        email: newWorker.email,
        usedAt: new Date()
      });
      if (invitation.usedCount >= invitation.maxUses) {
        invitation.status = 'USED';
      }
      await invitation.save();
    }

    // 7. Audit Logging (EMPLOYEE_REGISTERED event)
    try {
      await AuditLog.create({
        action: 'EMPLOYEE_REGISTERED',
        userId: newWorker._id,
        restaurantId: restaurant._id,
        invitationId: invitation ? invitation._id : null,
        metadata: {
          name: newWorker.name,
          email: newWorker.email,
          phone: newWorker.phone,
          role: newWorker.restaurantRole,
          status: newWorker.status,
          codeUsed: rawCode || 'DIRECT_REGISTRATION'
        },
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
      });
    } catch (auditErr) {
      console.warn('Failed to write registration audit log:', auditErr.message);
    }

    // 8. Response without auto-login (Section 14 & 21)
    return res.status(201).json({
      message: autoApprove
        ? 'Your employee account has been created. You can now sign in to Restaurant CRM.'
        : 'Your account is waiting for Restaurant Admin approval. You will be able to access the Restaurant CRM after approval.',
      status: finalStatus,
      autoApproved: autoApprove,
      user: {
        _id: newWorker._id,
        name: newWorker.name,
        email: newWorker.email,
        phone: newWorker.phone,
        restaurantRole: newWorker.restaurantRole,
        status: newWorker.status
      }
    });
  } catch (error) {
    console.error('Restaurant Employee Registration Error:', error);
    return res.status(500).json({ message: error.message || 'Registration failed.' });
  }
});

// @route   POST /api/auth/crm-login
// @desc    Dedicated CRM login endpoint with email or mobile identifier and server-side role validation
router.post('/crm-login', rateLimitAuth(10, 15), async (req, res) => {
  try {
    const { identifier, email, phone, password, rememberMe } = req.body;
    const loginTarget = (identifier || email || phone || '').trim();

    if (!loginTarget || !password) {
      return res.status(400).json({ message: 'Email or mobile number and password are required.' });
    }

    let user = null;
    if (isEmailIdentifier(loginTarget)) {
      user = await User.findOne({ email: loginTarget.toLowerCase() });
    } else {
      const phoneVariants = getPhoneSearchVariants(loginTarget);
      user = await User.findOne({ phone: { $in: phoneVariants } });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid mobile/email or password.' });
    }

    // Pending Approval Enforcement
    if (user.restaurantRole === 'PENDING_EMPLOYEE' || user.status === 'PENDING') {
      return res.status(403).json({
        message: 'Your employee account is awaiting approval.',
        pendingApproval: true
      });
    }

    // Deactivated / Inactive Account Enforcement
    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        message: 'Your account is currently disabled. Please contact the administrator.'
      });
    }

    // Server-Side Role Enforcement: Reject standard CUSTOMER accounts
    const normalizedRole = normalizeRestaurantRole(user);
    if (!normalizedRole || normalizedRole === 'CUSTOMER') {
      return res.status(403).json({ 
        message: 'CRM access denied.' 
      });
    }

    const { getOrCreateDefaultRestaurant } = await import('../utils/restaurantHelper.js');
    let restaurant = user.restaurantId ? await Restaurant.findById(user.restaurantId) : null;
    if (!restaurant) {
      restaurant = await getOrCreateDefaultRestaurant();
      user.restaurantId = restaurant._id;
      await user.save();
    }

    const token = generateToken(user._id, rememberMe);
    setTokenCookie(res, token, rememberMe);
    setCrmTokenCookie(res, token, rememberMe);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        restaurantRole: normalizedRole,
        restaurantId: restaurant._id
      },
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        phone: restaurant.phone,
        status: restaurant.status
      },
      permissions: getUserPermissions(user)
    });
  } catch (error) {
    console.error('CRM Login Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/crm-dev-admin
// @desc    Fast development sign-in as Restaurant Admin
router.post('/crm-dev-admin', async (req, res) => {
  try {
    const { getOrCreateDefaultRestaurant } = await import('../utils/restaurantHelper.js');
    const restaurant = await getOrCreateDefaultRestaurant();

    let user = await User.findOne({ $or: [{ email: 'admin@floveera.in' }, { email: 'admin@flovera.in' }] });

    if (!user) {
      const existingPhone = await User.findOne({ phone: '9113342012' });
      const adminPhone = existingPhone ? `91133${Math.floor(10000 + Math.random() * 90000)}` : '9113342012';

      user = await User.create({
        name: 'Karan Prasad (Admin)',
        email: 'admin@floveera.in',
        phone: adminPhone,
        password: 'Password123!',
        role: 'admin',
        restaurantRole: 'RESTAURANT_ADMIN',
        restaurantId: restaurant._id
      });
    } else {
      user.email = 'admin@floveera.in';
      user.restaurantRole = 'RESTAURANT_ADMIN';
      user.restaurantId = restaurant._id;
      user.password = 'Password123!';
      await user.save();
    }

    const token = generateToken(user._id, true);
    setTokenCookie(res, token, true);
    setCrmTokenCookie(res, token, true);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        restaurantRole: 'RESTAURANT_ADMIN',
        restaurantId: restaurant._id
      },
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        phone: restaurant.phone,
        status: restaurant.status
      },
      permissions: getUserPermissions(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/crm-dev-worker
// @desc    Fast development sign-in as Restaurant Worker
router.post('/crm-dev-worker', async (req, res) => {
  try {
    const { getOrCreateDefaultRestaurant } = await import('../utils/restaurantHelper.js');
    const restaurant = await getOrCreateDefaultRestaurant();

    let user = await User.findOne({ $or: [{ email: 'worker@floveera.in' }, { email: 'worker@flovera.in' }] });

    if (!user) {
      // Find a non-conflicting test phone
      const existingPhoneUser = await User.findOne({ phone: '9876543210' });
      const workerPhone = existingPhoneUser ? `98765${Math.floor(10000 + Math.random() * 90000)}` : '9876543210';
      
      user = await User.create({
        name: 'Rahul Kumar (Worker)',
        email: 'worker@floveera.in',
        phone: workerPhone,
        password: 'Password123!',
        role: 'user',
        restaurantRole: 'RESTAURANT_WORKER',
        restaurantId: restaurant._id
      });
    } else {
      user.email = 'worker@floveera.in';
      user.role = 'user';
      user.restaurantRole = 'RESTAURANT_WORKER';
      user.restaurantId = restaurant._id;
      await user.save();
    }

    const token = generateToken(user._id, true);
    setTokenCookie(res, token, true);
    setCrmTokenCookie(res, token, true);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        restaurantRole: 'RESTAURANT_WORKER',
        restaurantId: restaurant._id
      },
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        phone: restaurant.phone,
        status: restaurant.status
      },
      permissions: getUserPermissions(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

