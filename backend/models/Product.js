import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  vertical: {
    type: String,
    enum: ['restaurant', 'supermart', 'cakes'],
    required: true,
    default: 'supermart',
    index: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  category: {
    type: String,
    default: 'General',
    index: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  originalPrice: {
    type: Number,
    required: false,
  },
  stock: {
    type: Number,
    required: true,
    default: 50,
  },
  description: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  dietary: {
    type: String,
    enum: ['veg', 'non-veg', 'eggless', 'none'],
    default: 'none',
    index: true,
  },
  isBestseller: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  ratingCount: {
    type: Number,
    default: 38,
  },
  // Supermart multi-unit selection (e.g. 500g, 1kg, 2kg, pack)
  units: [
    {
      label: { type: String, required: true },
      price: { type: Number, required: true },
      originalPrice: { type: Number },
      stock: { type: Number, default: 50 },
    },
  ],
  // Customization options for restaurant / bakery
  customizationOptions: {
    spiceLevels: [{ type: String }],
    addOns: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    flavors: [{ type: String }],
  },
  // "Frequently Bought Together" bundles
  frequentlyBoughtTogether: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      imageUrl: { type: String, default: '' },
      unit: { type: String, default: '1 piece' },
    },
  ],
  estimatedDeliveryMins: {
    type: String,
    default: '25-35 mins',
  },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
