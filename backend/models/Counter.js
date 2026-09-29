import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

/**
 * Concurrency-safe atomic counter generator
 * Ensures sequential, gap-free, non-colliding order numbers per restaurant.
 */
counterSchema.statics.getNextOrderNumber = async function(restaurantId) {
  const counterId = `order_${restaurantId}`;
  const counter = await this.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(6, '0');
  return `LN-R-${formattedSeq}`;
};

/**
 * Concurrency-safe atomic counter generator for invoices
 * Ensures sequential, unique invoice numbers per restaurant.
 */
counterSchema.statics.getNextInvoiceNumber = async function(restaurantId) {
  const counterId = `invoice_${restaurantId}`;
  const counter = await this.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(6, '0');
  return `INV-LN-${formattedSeq}`;
};

export default mongoose.model('Counter', counterSchema);

