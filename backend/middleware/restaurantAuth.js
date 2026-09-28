import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import { getUserPermissions } from '../utils/permissions.js';
import { getOrCreateDefaultRestaurant } from '../utils/restaurantHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'floveera_secure_session_secret_jwt_2026';

/**
 * Normalizes restaurant role into RESTAURANT_ADMIN or RESTAURANT_WORKER
 */
export function normalizeRestaurantRole(user) {
  if (!user) return null;
  if (user.role === 'admin') return 'RESTAURANT_ADMIN';
  const role = user.restaurantRole;
  if (role === 'RESTAURANT_ADMIN' || role === 'RESTAURANT_OWNER' || role === 'RESTAURANT_MANAGER') {
    return 'RESTAURANT_ADMIN';
  }
  if (role === 'RESTAURANT_WORKER' || role === 'ORDER_MANAGER' || role === 'DELIVERY_MANAGER') {
    return 'RESTAURANT_WORKER';
  }
  return null;
}

/**
 * Verifies restaurant access with strict tenant isolation and role validation.
 * Customer users without a restaurant role are rejected with 403 Forbidden.
 */
export const verifyRestaurantAccess = async (req, res, next) => {
  try {
    const token = req.cookies?.crm_auth_token || req.cookies?.auth_token || 
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(401).json({ message: 'User session invalid. User not found.' });
    }

    // 1. BACKEND AUTHORIZATION: Validate that user has CRM role
    const normalizedRole = normalizeRestaurantRole(user);
    if (!normalizedRole) {
      return res.status(403).json({ 
        message: 'Access denied: Your account does not have access to Restaurant CRM.' 
      });
    }

    req.user = user;
    req.userId = user._id.toString();

    // 2. Resolve target restaurant
    let targetRestaurantId = req.params?.restaurantId || req.query?.restaurantId || req.body?.restaurantId;

    // 3. STRICT MULTI-TENANT ISOLATION (Anti-IDOR):
    // If a target restaurant ID is specified in URL/params, ensure user has membership to it
    if (targetRestaurantId && user.restaurantId) {
      if (user.restaurantId.toString() !== targetRestaurantId.toString()) {
        return res.status(403).json({ 
          message: 'Access denied: You are not authorized to access this restaurant workspace.' 
        });
      }
    }

    let restaurant = null;

    if (targetRestaurantId) {
      if (!mongoose.Types.ObjectId.isValid(targetRestaurantId)) {
        return res.status(400).json({ message: 'Invalid restaurant ID format.' });
      }
      restaurant = await Restaurant.findById(targetRestaurantId);
    } else {
      if (user.restaurantId) {
        restaurant = await Restaurant.findById(user.restaurantId);
      } else {
        restaurant = await getOrCreateDefaultRestaurant();
        user.restaurantId = restaurant._id;
        await user.save();
      }
    }

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    if (restaurant.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'This restaurant workspace is currently INACTIVE.' });
    }

    // Verify match with final loaded restaurant
    if (user.restaurantId && user.restaurantId.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied: You are not authorized to access this restaurant workspace.' 
      });
    }


    req.restaurant = restaurant;
    req.restaurantId = restaurant._id.toString();
    req.restaurantRole = normalizedRole;
    req.permissions = getUserPermissions(user);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired session token.' });
    }
    console.error('Restaurant Access Auth Error:', error);
    return res.status(500).json({ message: error.message || 'Restaurant authorization error' });
  }
};

/**
 * Middleware to enforce granular restaurant permission
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.user?.role === 'admin' || req.restaurantRole === 'RESTAURANT_ADMIN') {
      return next();
    }

    if (!req.permissions || !Array.isArray(req.permissions) || !req.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Access denied: Requires permission '${permission}'.` 
      });
    }

    return next();
  };
};

/**
 * Middleware to enforce specific restaurant role (e.g. RESTAURANT_ADMIN)
 */
export const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (req.user?.role === 'admin' || roles.includes(req.restaurantRole)) {
      return next();
    }

    return res.status(403).json({ 
      message: `Access denied: Requires role ${roles.join(' or ')}.` 
    });
  };
};
