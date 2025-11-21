import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      bookId: { type: String, required: true },
      quantity: Number,
      price: Number
    }
  ],
  totalPrice: Number,
  name: String,
  shippingAddress: String,
  orderNote: String,
  payment: {
    cardNumber: { type: String, required: true },
    CVV: { type: String, required: true },
    expiredDate: { type: String, required: true }
  }
}, { timestamps: true }); 
export const Order = mongoose.model("Order", orderSchema);

