import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Routes
import cartRoutes from './routes/cart.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON request bodies

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use('/api', cartRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Cart Service is running');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});
