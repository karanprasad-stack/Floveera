import mongoose from 'mongoose';

const cakeOrderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: false
  },
  customerPhone: {
    type: String,
    required: true
  },
  cakeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cake',
    required: false // Might be a custom cake not in catalog
  },
  size: {
    type: String
  },
  flavor: {
    type: String
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  specialInstructions: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('CakeOrder', cakeOrderSchema);
