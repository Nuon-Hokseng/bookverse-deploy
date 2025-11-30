import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getUserOrders);
// Admin: list all orders (no auth here for simplicity; secure as needed)
router.get("/all", getAllOrders);
// Admin: update order status
router.patch("/:id/status", updateOrderStatus);

export default router;
