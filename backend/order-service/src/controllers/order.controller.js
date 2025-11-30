import axios from "axios";
import { Order } from "../models/order.model.js";

export const createOrder = async (req, res) => {
  try {
    console.log("[Order Controller] Create order request received");
    console.log("[Order Controller] Headers:", {
      authorization: req.header("Authorization"),
      "x-user-id": req.header("x-user-id"),
      "x-user-role": req.header("x-user-role"),
      "x-user-email": req.header("x-user-email"),
      cookie: req.header("Cookie"),
    });
    console.log("[Order Controller] req.user:", req.user);
    console.log("[Order Controller] Body:", req.body);

    if (!req.user || !req.user.id) {
      console.error(
        "[Order Controller] Authentication failed: No user or user ID"
      );
      return res
        .status(401)
        .json({ message: "Unauthorized: missing or invalid token" });
    }
    const userId = req.user.id;
    console.log("[Order Controller] User ID:", userId);

    const { name, shippingAddress, cardNumber, CVV, expiredDate, orderNote } =
      req.body;
    if (!name || !shippingAddress || !cardNumber || !CVV || !expiredDate) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const CART_SERVICE_URL = process.env.CART_SERVICE_URL;
    const CART_SERVICE_TOKEN = process.env.CART_SERVICE_TOKEN;

    if (!CART_SERVICE_URL) {
      return res
        .status(500)
        .json({ message: "CART_SERVICE_URL is not configured" });
    }

    const cartEndpoint = `${CART_SERVICE_URL.replace(/\/+$/, "")}/cart`;

    let cart;
    try {
      console.log("Calling Cart Service GET /cart:", cartEndpoint);

      // Forward authentication - use x-user-* headers if available, otherwise Authorization
      const headers = {};
      if (req.header("x-user-id")) {
        headers["x-user-id"] = req.header("x-user-id");
        headers["x-user-role"] = req.header("x-user-role");
        headers["x-user-email"] = req.header("x-user-email");
        console.log(
          "[Order Controller] Forwarding user headers to cart service:",
          headers
        );
      } else if (req.header("Authorization")) {
        headers["Authorization"] = req.header("Authorization");
        console.log(
          "[Order Controller] Forwarding Authorization header to cart service"
        );
      }

      const cartResponse = await axios.get(cartEndpoint, { headers });
      cart = cartResponse.data;
      console.log("Cart data:", cart);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error fetching cart from Cart Service";
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
    return res
      .status(500)
      .json({ message: "Internal server error", details: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("Unauthorized request: req.user is missing or invalid", {
        user: req.user,
      });
      return res
        .status(401)
        .json({ message: "Unauthorized: missing or invalid token" });
    }

    const userId = req.user.id;

    // Fetch orders, exclude 'payment', include only necessary fields
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .select("-payment");

    res.json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // Admin listing: return all orders, newest first, without payment details
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .select("-payment");
    res.json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    console.log("[Update Status] Request received:", {
      orderId: req.params.id,
      body: req.body,
      status: req.body?.status,
    });

    const { id } = req.params;
    const { status } = req.body || {};

    if (!status) {
      console.error("[Update Status] Missing status in request body");
      return res.status(400).json({ message: "Status is required" });
    }

    const allowed = ["pending", "success", "fail"];
    if (!allowed.includes(status)) {
      console.error("[Update Status] Invalid status value:", status);
      return res
        .status(400)
        .json({ message: "Invalid status. Must be pending, success, or fail" });
    }

    console.log("[Update Status] Updating order", id, "to status:", status);

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-payment");

    if (!updated) {
      console.error("[Update Status] Order not found:", id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(
      "[Update Status] Successfully updated order:",
      updated._id,
      "to status:",
      updated.status
    );
    res.json(updated);
  } catch (err) {
    console.error("[Update Status] Error:", err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
};
