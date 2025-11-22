import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import cookieParser from "cookie-parser";

dotenv.config();

const SERVICE_PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.get('/health', (req, res) => res.json({ status: 'UP' }));

connectDB();

app.listen(SERVICE_PORT, () => console.log(`Auth Service running on port ${SERVICE_PORT}`));
