import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  sku: {
    type: String,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'Grains & Staples'
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  threshold: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'kg'
  },
  unitCost: {
    type: Number,
    default: 0
  },
  supplier: {
    type: String,
    trim: true,
    default: 'Local Wholesale Supplier'
  },
  status: {
    type: String,
    enum: ['Optimal', 'Low Stock', 'Critical'],
    default: 'Optimal'
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  lastConsumed: {
    type: Date
  }
}, { timestamps: true });

// Compound index for querying items within restaurant
inventoryItemSchema.index({ restaurantId: 1, name: 1 });
inventoryItemSchema.index({ restaurantId: 1, category: 1 });

export default mongoose.model('InventoryItem', inventoryItemSchema);
