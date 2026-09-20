import mongoose from 'mongoose';

const cakeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  flavors: [{
    type: String
  }],
  sizes: [{
    type: String
  }]
}, { timestamps: true });

export default mongoose.model('Cake', cakeSchema);
