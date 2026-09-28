import mongoose from 'mongoose';

export const VALID_STATUS_TRANSITIONS = {
  PLACED: ['RECEIVED', 'CONFIRMED', 'CANCELLED'],
  RECEIVED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: []
};

const orderItemSnapshotSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: false
  },
  nameSnapshot: {
    type: String,
    required: true
  },
  skuSnapshot: {
    type: String,
    default: ''
  },
  priceSnapshot: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  variant: {
    type: String,
    default: ''
  },
  addons: [{
    name: String,
    price: Number
  }],
  notes: {
    type: String,
    default: ''
  },
  total: {
    type: Number,
    required: true
  },
  // Backward compatibility fields for customer website
  name: {
    type: String
  },
  price: {
    type: Number
  },
  originalPrice: {
    type: Number
  },
  unit: {
    type: String
  },
  image: {
    type: String
  },
  customization: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: true });

// Pre-save hook to ensure compatibility fields match snapshots
orderItemSnapshotSchema.pre('validate', function() {
  if (!this.name) this.name = this.nameSnapshot;
  if (this.price === undefined) this.price = this.priceSnapshot;
});

const orderTimelineSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: [
      'ORDER_CREATED',
      'ORDER_RECEIVED',
      'ORDER_CONFIRMED',
      'ORDER_PREPARING',
      'ORDER_READY',
      'ORDER_OUT_FOR_DELIVERY',
      'ORDER_DELIVERED',
      'ORDER_CANCELLED',
      'PAYMENT_UPDATED'
    ]
  },
  status: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  performedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'System' },
    role: { type: String, default: 'system' }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Alias for backward compatibility
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // Customer Snapshot
  customer: {
    name: { type: String, required: true },
    phone: { type: String, default: 'N/A' },
    email: { type: String, default: 'customer@floveera.in' }
  },
  storeName: {
    type: String,
    default: 'Floveera Restaurant'
  },
  vertical: {
    type: String,
    enum: ['restaurant', 'supermart', 'cakes', 'mixed'],
    default: 'restaurant'
  },
  items: [orderItemSnapshotSchema],
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  taxes: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  grandTotal: {
    type: Number,
    required: true
  },
  // Delivery Address Snapshot (Preserved at order time)
  deliveryAddress: {
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  customerNotes: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['WEBSITE', 'MANUAL'],
    default: 'WEBSITE',
    index: true
  },
  idempotencyKey: {
    type: String,
    index: true,
    sparse: true
  },
  orderStatus: {
    type: String,
    enum: ['PLACED', 'RECEIVED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED',
    index: true
  },
  // Backward compatibility status field (lowercase)
  status: {
    type: String,
    default: 'placed',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'whatsapp', 'cod', 'card', 'upi'],
    default: 'online'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  estimatedDeliveryTime: {
    type: String,
    default: '25–35 mins'
  },
  timeline: [orderTimelineSchema]
}, { timestamps: true });

// Sync aliases before validation
orderSchema.pre('validate', function() {
  if (!this.user && this.customerId) {
    this.user = this.customerId;
  }
  if (!this.customerId && this.user) {
    this.customerId = this.user;
  }
  if (this.orderStatus) {
    this.status = this.orderStatus.toLowerCase();
  } else if (this.status) {
    this.orderStatus = this.status.toUpperCase();
  }
  if (this.total !== undefined && this.grandTotal === undefined) {
    this.grandTotal = this.total;
  }
  if (this.grandTotal !== undefined && this.total === undefined) {
    this.total = this.grandTotal;
  }
  if (this.tax !== undefined && this.taxes === undefined) {
    this.taxes = this.tax;
  }
  if (this.taxes !== undefined && this.tax === undefined) {
    this.tax = this.taxes;
  }
});

// Compound indexes for CRM and Order History performance
orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, orderStatus: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, orderNumber: 1 });

export default mongoose.model('Order', orderSchema);

