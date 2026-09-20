import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false // Optional for now
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
