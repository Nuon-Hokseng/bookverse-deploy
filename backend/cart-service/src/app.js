import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cartRoutes from "./routes/cart.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, "..", ".env") });

const PORT = process.env.PORT || process.env.SERVICE_PORT || 3001;

const app = express();
app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api", cartRoutes);
app.get("/health", (req, res) => res.json({ status: "UP" }));

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("MongoDB connected");
    const server = app.listen(PORT, () => {
      console.log(`Cart Service running on port ${PORT}`);
    });
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down Cart Service gracefully...");
      server.close(() => process.exit(0));
    });
  })
  .catch((err) => console.error(err));
