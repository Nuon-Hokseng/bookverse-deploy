import mongoose from "mongoose";
import dotenv from "dotenv";
import Cart from "./models/cart.model.js";
import CartItem from "./models/cartItem.model.js";

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to MongoDB");

    // Clear existing carts and cart items
    await CartItem.deleteMany({});
    await Cart.deleteMany({});
    console.log("Cleared existing carts and cart items");

    console.log("✅ Cart database is ready (empty state for fresh start)");
    console.log(
      "Note: Carts will be created automatically when users add items"
    );

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
