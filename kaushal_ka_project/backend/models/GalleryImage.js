import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('GalleryImage', galleryImageSchema);
