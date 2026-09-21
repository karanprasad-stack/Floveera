import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  image: {
    type: String,
    default: '',
  },
  vertical: {
    type: String,
    enum: ['restaurant', 'supermart', 'cakes'],
    default: 'supermart',
  },
  unit: {
    type: String,
    default: '',
  },
  customization: {
    spiceLevel: { type: String, default: '' },
    addOns: [
      {
        name: { type: String },
        price: { type: Number },
      }
    ],
    notes: { type: String, default: '' },
    weight: { type: String, default: '' },
    flavor: { type: String, default: '' },
    cakeMessage: { type: String, default: '' },
    deliveryDate: { type: String, default: '' },
    deliverySlot: { type: String, default: '' },
    isEggless: { type: Boolean, default: false },
    selectedUnit: { type: String, default: '' },
    packSize: { type: String, default: '' },
  },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
