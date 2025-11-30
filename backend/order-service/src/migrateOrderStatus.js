import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Order } from "./models/order.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function migrateOrderStatus() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Find all orders without status field
    const ordersWithoutStatus = await Order.find({
      status: { $exists: false },
    });
    console.log(
      `Found ${ordersWithoutStatus.length} orders without status field`
    );

    if (ordersWithoutStatus.length === 0) {
      console.log("All orders already have status field. No migration needed.");
      process.exit(0);
    }

    // Update all orders without status to have default "pending"
    const result = await Order.updateMany(
      { status: { $exists: false } },
      { $set: { status: "pending" } }
    );

    console.log(
      `Migration complete: Updated ${result.modifiedCount} orders with status="pending"`
    );

    // Verify
    const allOrders = await Order.find({}).select("_id status name");
    console.log("\nAll orders after migration:");
    allOrders.forEach((order) => {
      console.log(
        `  Order ${order._id}: status="${order.status}" (${order.name})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateOrderStatus();
