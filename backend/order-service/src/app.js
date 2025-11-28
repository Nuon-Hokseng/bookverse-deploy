import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./routes/order.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const SERVICE_PORT = process.env.SERVICE_PORT || process.env.PORT || 3002;

const app = express();
app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/orders", orderRoutes);
app.get("/health", (req, res) => res.json({ status: "UP" }));

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(SERVICE_PORT, () =>
      console.log(`Order Service running on port ${SERVICE_PORT}`)
    );
  })
  .catch((err) => console.error(err));
