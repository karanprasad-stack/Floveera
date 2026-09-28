import mongoose from 'mongoose';

const employeeInvitationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: null
  },
  role: {
    type: String,
    enum: ['RESTAURANT_WORKER'],
    default: 'RESTAURANT_WORKER'
  },
  autoApprove: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'USED', 'EXPIRED', 'REVOKED'],
    default: 'ACTIVE',
    index: true
  },
  maxUses: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model('EmployeeInvitation', employeeInvitationSchema);
