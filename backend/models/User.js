import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home'
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: {
    type: String,
    default: ''
  },
  landmark: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Safe tokenized payment methods (NO sensitive CVV/PIN/full card numbers)
const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['card', 'upi'],
    required: true
  },
  cardBrand: {
    type: String // Visa, Mastercard, RuPay, etc.
  },
  last4: {
    type: String // e.g. 4821
  },
  holderName: {
    type: String
  },
  expiryMonth: {
    type: String
  },
  expiryYear: {
    type: String
  },
  upiId: {
    type: String // e.g. karan@upi
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    index: true
  },
  restaurantRole: {
    type: String,
    enum: [
      'RESTAURANT_ADMIN',
      'RESTAURANT_WORKER',
      'PENDING_EMPLOYEE',
      'RESTAURANT_OWNER',
      'RESTAURANT_MANAGER',
      'ORDER_MANAGER',
      'INVENTORY_MANAGER',
      'DELIVERY_MANAGER',
      'SUPPORT',
      null
    ],
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE',
    index: true
  },
  customPermissions: [{
    type: String
  }],
  addresses: [addressSchema],
  paymentMethods: [paymentMethodSchema],
  notificationPreferences: {
    orderUpdates: { type: Boolean, default: true },
    promotionalNotifications: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    whatsappOrderUpdates: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true }
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, { timestamps: true });

// Clean empty fields so sparse indexes ignore undefined values
userSchema.pre('validate', function() {
  if (this.email === '' || this.email === null) {
    this.email = undefined;
  }
  if (this.phone === '' || this.phone === null) {
    this.phone = undefined;
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
