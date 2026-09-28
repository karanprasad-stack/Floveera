import mongoose from 'mongoose';

const openingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  openTime: {
    type: String,
    default: '09:00'
  },
  closeTime: {
    type: String,
    default: '22:30'
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Floveera Restaurant'
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    default: 'floveera-restaurant'
  },
  logo: {
    type: String,
    default: '/images/floveera_logo_clean.png'
  },
  phone: {
    type: String,
    required: true,
    default: '+91 91133 42012'
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    default: 'contact@floveera.in'
  },
  address: {
    type: String,
    required: true,
    default: 'Main Road, Near Block Office'
  },
  city: {
    type: String,
    required: true,
    default: 'Bhagwanpur'
  },
  state: {
    type: String,
    required: true,
    default: 'Bihar'
  },
  pincode: {
    type: String,
    required: true,
    default: '821102'
  },
  country: {
    type: String,
    default: 'India'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  taxConfiguration: {
    enabled: {
      type: Boolean,
      default: true
    },
    rate: {
      type: Number,
      default: 5 // 5% GST
    },
    gstNumber: {
      type: String,
      default: ''
    }
  },
  openingHours: {
    type: [openingHoursSchema],
    default: () => [
      { day: 'Monday', openTime: '09:00', closeTime: '22:30', isOpen: true },
      { day: 'Tuesday', openTime: '09:00', closeTime: '22:30', isOpen: true },
      { day: 'Wednesday', openTime: '09:00', closeTime: '22:30', isOpen: true },
      { day: 'Thursday', openTime: '09:00', closeTime: '22:30', isOpen: true },
      { day: 'Friday', openTime: '09:00', closeTime: '22:30', isOpen: true },
      { day: 'Saturday', openTime: '09:00', closeTime: '23:00', isOpen: true },
      { day: 'Sunday', openTime: '09:00', closeTime: '23:00', isOpen: true },
    ]
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true
  }
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
