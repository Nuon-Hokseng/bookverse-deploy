import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "./models/order.model.js";

dotenv.config();

// Sample orders for testing
const demoOrders = [
  {
    userId: "demo-user-1",
    items: [
      {
        bookId: "1",
        quantity: 2,
        price: 14.99,
      },
      {
        bookId: "4",
        quantity: 1,
        price: 16.99,
      },
    ],
    totalPrice: 46.97,
    name: "John Doe",
    shippingAddress: "123 Main St, New York, NY 10001",
    orderNote: "Please handle with care",
    payment: {
      cardNumber: "************1234",
      CVV: "***",
      expiredDate: "12/25",
    },
  },
  {
    userId: "demo-user-2",
    items: [
      {
        bookId: "5",
        quantity: 1,
        price: 11.99,
      },
    ],
    totalPrice: 11.99,
    name: "Jane Smith",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
    orderNote: "",
    payment: {
      cardNumber: "************5678",
      CVV: "***",
      expiredDate: "06/26",
    },
  },
  {
    userId: "demo-user-1",
    items: [
      {
        bookId: "7",
        quantity: 1,
        price: 13.49,
      },
      {
        bookId: "3",
        quantity: 1,
        price: 13.99,
      },
    ],
    totalPrice: 27.48,
    name: "John Doe",
    shippingAddress: "123 Main St, New York, NY 10001",
    orderNote: "Gift wrap please",
    payment: {
      cardNumber: "************1234",
      CVV: "***",
      expiredDate: "12/25",
    },
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to MongoDB");

    // Clear existing orders
    await Order.deleteMany({});
    console.log("Cleared existing orders");

    // Insert demo orders
    await Order.insertMany(demoOrders);
    console.log(`Successfully seeded ${demoOrders.length} demo orders`);

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
