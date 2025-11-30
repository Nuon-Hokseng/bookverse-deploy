import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        bookId: { type: String, required: true },
        // Store book title for history display without extra lookups
        title: { type: String },
        quantity: Number,
        price: Number,
      },
    ],
    totalPrice: Number,
    name: String,
    shippingAddress: String,
    orderNote: String,
    status: {
      type: String,
      enum: ["pending", "success", "fail"],
      default: "pending",
    },
    payment: {
      cardNumber: { type: String, required: true },
      CVV: { type: String, required: true },
      expiredDate: { type: String, required: true },
    },
  },
  { timestamps: true }
);
export const Order = mongoose.model("Order", orderSchema);
