import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  transactionId: {
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
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
    index: true
  },
  itemNameSnapshot: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  transactionType: {
    type: String,
    enum: ['CONSUMPTION', 'RESTOCK', 'ADJUSTMENT', 'CORRECTION'],
    default: 'CONSUMPTION',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.001
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  stockBefore: {
    type: Number,
    required: true
  },
  stockAfter: {
    type: Number,
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workerName: {
    type: String,
    required: true,
    trim: true
  },
  workerRole: {
    type: String,
    default: 'RESTAURANT_WORKER'
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Compound indexes for history queries
inventoryTransactionSchema.index({ restaurantId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ restaurantId: 1, workerId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ restaurantId: 1, itemId: 1, createdAt: -1 });

export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
