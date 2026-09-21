import express from 'express';
import jwt from 'jsonwebtoken';
import Cart from '../models/Cart.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'floveera_secure_session_secret_jwt_2026';

// Middleware to extract authenticated user from cookie or Authorization header
const authenticateUser = (req, res, next) => {
  const token = req.cookies?.auth_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required for persistent cart' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }
};

// @route   GET /api/cart
// @desc    Get current user's persistent cart
router.get('/', authenticateUser, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = await Cart.create({ userId: req.userId, items: [] });
    }
    res.json({ items: cart.items || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart/sync
// @desc    Merge guest cart items with user's saved cart upon login
router.post('/sync', authenticateUser, async (req, res) => {
  try {
    const { guestItems = [] } = req.body;

    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    const mergedItems = [...cart.items];

    for (const guestItem of guestItems) {
      const matchIndex = mergedItems.findIndex((item) => item.id === guestItem.id);
      if (matchIndex > -1) {
        // Merge quantities for matching item & customizations
        mergedItems[matchIndex].quantity += (guestItem.quantity || 1);
      } else {
        mergedItems.push(guestItem);
      }
    }

    cart.items = mergedItems;
    await cart.save();

    res.json({ items: cart.items, message: 'Cart synchronized successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/cart
// @desc    Update/save user's entire cart state
router.put('/', authenticateUser, async (req, res) => {
  try {
    const { items = [] } = req.body;

    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items });
    } else {
      cart.items = items;
    }

    await cart.save();
    res.json({ items: cart.items, message: 'Cart saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear user's cart (e.g. after order placement)
router.delete('/', authenticateUser, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.userId },
      { items: [] },
      { new: true, upsert: true }
    );
    res.json({ items: [], message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
