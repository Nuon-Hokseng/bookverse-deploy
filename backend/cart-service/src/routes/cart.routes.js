import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getCart,
  addToCart,
  removeOneFromCart,
  removeCartItem,
} from "../controllers/cart.controller.js";

const router = express.Router();

// ================================
// GET USER CART
// ================================
router.get("/cart", authMiddleware, getCart);

// ================================
// ADD ONE TO CART (+1)
// ================================
router.post("/cart/add", authMiddleware, addToCart);

// ================================
// REMOVE ONE FROM CART (-1)
// ================================
router.post("/cart/remove", authMiddleware, removeOneFromCart);

// ================================
// REMOVE CART ITEM COMPLETELY
// ================================
router.delete("/cart/item/:itemId", authMiddleware, removeCartItem);

export default router;
