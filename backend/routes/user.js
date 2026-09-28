import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// ==========================================
// 1. PROFILE INFORMATION
// ==========================================

// @route   GET /api/user/profile
// @desc    Get current user profile with addresses & payment methods
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/user/profile
// @desc    Update personal information (name, phone, avatar)
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    const trimmedPhone = phone ? phone.trim() : '';
    if (trimmedPhone && !/^[0-9+ -]{8,15}$/.test(trimmedPhone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number (8-15 digits)' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if phone is already used by another user
    if (trimmedPhone && trimmedPhone !== user.phone) {
      const existingUserWithPhone = await User.findOne({ phone: trimmedPhone, _id: { $ne: user._id } });
      if (existingUserWithPhone) {
        return res.status(400).json({ message: 'This phone number is already registered with another account' });
      }
      user.phone = trimmedPhone;
    } else if (!trimmedPhone) {
      user.phone = undefined;
    }

    user.name = name.trim();
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    const sanitizedUser = await User.findById(user._id).select('-password -resetPasswordToken -resetPasswordExpires');
    res.json({
      message: 'Profile updated successfully',
      user: sanitizedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/user/password
// @desc    Change account password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'Current password, new password, and confirmation are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Need password field to compare
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword; // Automatically hashed in pre-save hook
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/user/notifications
// @desc    Update notification preferences
router.put('/notifications', async (req, res) => {
  try {
    const { orderUpdates, promotionalNotifications, emailNotifications, whatsappOrderUpdates, smsNotifications } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationPreferences = {
      orderUpdates: orderUpdates !== undefined ? Boolean(orderUpdates) : user.notificationPreferences.orderUpdates,
      promotionalNotifications: promotionalNotifications !== undefined ? Boolean(promotionalNotifications) : user.notificationPreferences.promotionalNotifications,
      emailNotifications: emailNotifications !== undefined ? Boolean(emailNotifications) : user.notificationPreferences.emailNotifications,
      whatsappOrderUpdates: whatsappOrderUpdates !== undefined ? Boolean(whatsappOrderUpdates) : user.notificationPreferences.whatsappOrderUpdates,
      smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : user.notificationPreferences.smsNotifications,
    };

    await user.save();
    res.json({
      message: 'Notification preferences updated',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 2. SAVED ADDRESSES
// ==========================================

// @route   GET /api/user/addresses
// @desc    Get user's saved addresses
router.get('/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('addresses');
    res.json(user?.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/addresses
// @desc    Add a new address
router.post('/addresses', async (req, res) => {
  try {
    const { label, fullName, phone, addressLine1, addressLine2, landmark, city, state, pincode, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ message: 'Full name, phone, address line 1, city, state, and pincode are required' });
    }

    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      return res.status(400).json({ message: 'Please enter a valid 6-digit pincode' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const makeDefault = isDefault || user.addresses.length === 0;

    if (makeDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    const newAddress = {
      label: ['Home', 'Work', 'Other'].includes(label) ? label : 'Home',
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 ? addressLine2.trim() : '',
      landmark: landmark ? landmark.trim() : '',
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: makeDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    const createdAddress = user.addresses[user.addresses.length - 1];
    res.status(201).json({
      message: 'Address added successfully',
      address: createdAddress,
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/user/addresses/:id
// @desc    Update an existing address
router.put('/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { label, fullName, phone, addressLine1, addressLine2, landmark, city, state, pincode, isDefault } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
      address.isDefault = true;
    }

    if (label) address.label = ['Home', 'Work', 'Other'].includes(label) ? label : address.label;
    if (fullName) address.fullName = fullName.trim();
    if (phone) address.phone = phone.trim();
    if (addressLine1) address.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
    if (landmark !== undefined) address.landmark = landmark.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (pincode) {
      if (!/^[0-9]{6}$/.test(pincode.trim())) {
        return res.status(400).json({ message: 'Please enter a valid 6-digit pincode' });
      }
      address.pincode = pincode.trim();
    }

    await user.save();
    res.json({
      message: 'Address updated successfully',
      address,
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/user/addresses/:id
// @desc    Delete an address
router.delete('/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull({ _id: id });

    // If default was deleted and there are remaining addresses, set the first as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/user/addresses/:id/default
// @desc    Set address as default
router.put('/addresses/:id/default', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetAddress = user.addresses.id(id);
    if (!targetAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === id;
    });

    await user.save();
    res.json({
      message: 'Default address updated',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 3. SAVED PAYMENT METHODS (SAFE / TOKENIZED)
// ==========================================

// @route   GET /api/user/payment-methods
// @desc    Get user's saved payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('paymentMethods');
    res.json(user?.paymentMethods || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/payment-methods
// @desc    Add a tokenized/masked payment method
// NEVER accepts or stores raw card numbers, CVV, or PINs!
router.post('/payment-methods', async (req, res) => {
  try {
    const { type, cardBrand, last4, holderName, expiryMonth, expiryYear, upiId, isDefault } = req.body;

    if (!type || !['card', 'upi'].includes(type)) {
      return res.status(400).json({ message: 'Valid payment method type (card or upi) is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const makeDefault = isDefault || user.paymentMethods.length === 0;

    if (makeDefault) {
      user.paymentMethods.forEach(pm => { pm.isDefault = false; });
    }

    let newMethod = {};

    if (type === 'card') {
      if (!last4 || !/^[0-9]{4}$/.test(last4.trim())) {
        return res.status(400).json({ message: 'Valid last 4 digits of card are required' });
      }
      newMethod = {
        type: 'card',
        cardBrand: cardBrand ? cardBrand.trim() : 'Card',
        last4: last4.trim(),
        holderName: holderName ? holderName.trim() : user.name,
        expiryMonth: expiryMonth || '12',
        expiryYear: expiryYear || '28',
        isDefault: makeDefault
      };
    } else if (type === 'upi') {
      if (!upiId || !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
        return res.status(400).json({ message: 'Please enter a valid UPI ID (e.g. username@bank)' });
      }
      newMethod = {
        type: 'upi',
        upiId: upiId.trim(),
        isDefault: makeDefault
      };
    }

    user.paymentMethods.push(newMethod);
    await user.save();

    res.status(201).json({
      message: 'Payment method saved securely',
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/user/payment-methods/:id
// @desc    Remove a payment method
router.delete('/payment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pm = user.paymentMethods.id(id);
    if (!pm) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    user.paymentMethods.pull({ _id: id });
    if (user.paymentMethods.length > 0 && !user.paymentMethods.some(p => p.isDefault)) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();
    res.json({
      message: 'Payment method removed',
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
