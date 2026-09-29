import mongoose from 'mongoose';

const invoiceItemSnapshotSchema = new mongoose.Schema({
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
  }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
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
  // Customer Snapshot (Preserved at order/invoice creation)
  customerSnapshot: {
    name: { type: String, required: true },
    phone: { type: String, default: 'N/A' },
    email: { type: String, default: 'customer@floveera.in' },
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
    }
  },
  // Restaurant Snapshot (Preserved at order/invoice creation)
  restaurantSnapshot: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, default: 'Bhagwanpur' },
    state: { type: String, default: 'Bihar' },
    pincode: { type: String, default: '821102' },
    phone: { type: String, default: '+91 91133 42012' },
    email: { type: String, default: 'contact@floveera.in' },
    gstin: { type: String, default: '' }
  },
  itemsSnapshot: [invoiceItemSnapshotSchema],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
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
  taxDetails: {
    rate: { type: Number, default: 5 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 }
  },
  total: {
    type: Number,
    required: true
  },
  grandTotal: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    required: true
  },
  orderStatus: {
    type: String,
    default: 'PLACED'
  },
  orderDate: {
    type: Date,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

invoiceSchema.index({ restaurantId: 1, createdAt: -1 });
invoiceSchema.index({ customerId: 1, createdAt: -1 });

export default mongoose.model('Invoice', invoiceSchema);
