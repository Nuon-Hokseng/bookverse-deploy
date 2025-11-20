import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, default: 1, min: 1 } // removed price field
}, { timestamps: true });

export default mongoose.model('CartItem', cartItemSchema);
