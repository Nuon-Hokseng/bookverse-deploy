import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || process.env.SERVICE_PORT || 5000;

const app = express();
app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.get("/health", (req, res) => res.json({ status: "UP" }));

connectDB();

const server = app.listen(PORT, () =>
  console.log(`Auth Service running on port ${PORT}`)
);

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down Auth Service gracefully...");
  server.close(() => process.exit(0));
});
