import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./src/routes/book.routes.js";

dotenv.config();

const SERVICE_PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/books", bookRoutes);
app.get('/health', (req, res) => res.json({ status: 'UP' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(SERVICE_PORT, () => console.log(`Book Service running on port ${SERVICE_PORT}`));
  })
  .catch(err => console.error(err));
