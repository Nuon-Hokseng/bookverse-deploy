import dotenv from 'dotenv';
dotenv.config();  // <- load .env first

import connectDB from './src/config/db.js';  // your mongoose connection code
import express from 'express';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import { swaggerDocs } from './src/swagger/swagger.js';
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

connectDB(); // connect to MongoDB


const PORT = process.env.PORT || 5000;
// mount swagger docs
swaggerDocs(app, PORT);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
