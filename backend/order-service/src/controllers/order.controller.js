import axios from 'axios';
import { Order } from '../models/order.model.js';

export const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: missing or invalid token" });
    }
    const userId = req.user.id;

    const { name, shippingAddress, cardNumber, CVV, expiredDate, orderNote } = req.body;
    if (!name || !shippingAddress || !cardNumber || !CVV || !expiredDate) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const CART_SERVICE_URL = process.env.CART_SERVICE_URL;
    const CART_SERVICE_TOKEN = process.env.CART_SERVICE_TOKEN;

    if (!CART_SERVICE_URL) {
      return res.status(500).json({ message: "CART_SERVICE_URL is not configured" });
    }

    const cartEndpoint = `${CART_SERVICE_URL.replace(/\/+$/, "")}/cart`;

    let cart;
    try {
      console.log("Calling Cart Service GET /cart:", cartEndpoint);
      const cartResponse = await axios.get(cartEndpoint, {
        headers: { Authorization: req.header("Authorization") },
      });
      cart = cartResponse.data;
      console.log("Cart data:", cart);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Error fetching cart from Cart Service";
      console.error("Cart Service GET error:", message);
      return res.status(err.response?.status || 500).json({ message });
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      bookId: item.book._id,
      title: item.book.title,
      quantity: item.quantity,
      price: item.price,
    }));

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

    const order = await Order.create({
      userId,
      items: orderItems,
      totalPrice,
      name,
      shippingAddress,
      orderNote,
      payment: { cardNumber, CVV, expiredDate },
    });

    try {
      console.log("Calling Cart Service DELETE /cart/clear");
      await axios.delete(`${cartEndpoint}/clear`, {
        headers: { "X-Service-Token": CART_SERVICE_TOKEN },
        data: { userId }, // body for Cart Service
      });
    } catch (err) {
      console.warn(
        "Failed to clear cart after order creation:",
        err.response?.data || err.message
      );
    }

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (err) {
    console.error("Unexpected error in createOrder:", err);
    return res.status(500).json({ message: "Internal server error", details: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error('Unauthorized request: req.user is missing or invalid', { user: req.user });
      return res.status(401).json({ message: 'Unauthorized: missing or invalid token' });
    }

    const userId = req.user.id;

    // Fetch orders, exclude 'payment', include only necessary fields
    const orders = await Order.find({ userId })
                              .sort({ createdAt: -1 })
                              .select('-payment');

    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err.message);
    res.status(500).json({ message: err.message });
  }
};
