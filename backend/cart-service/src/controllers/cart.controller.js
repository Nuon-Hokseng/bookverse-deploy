import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import axios from "axios";

// For fetching book details from book-service
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || "http://localhost:3004/api/books";

// ================================
// Helper: fetch book details
// ================================
const fetchBookDetails = async (bookId) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_URL.replace(/\/+$/, "")}/${bookId}`);
    return response.data;
  } catch (err) {
    console.warn(`Book not found: ${bookId}`);
    return null;
  }
};

// ================================
// Helper: get cart details with populated books
// ================================
const getCartDetails = async (cartId) => {
  const items = await CartItem.find({ cart: cartId });
  return await Promise.all(
    items.map(async (i) => {
      const book = await fetchBookDetails(i.book);
      return {
        _id: i._id,
        quantity: i.quantity,
        price: book ? book.price * i.quantity : 0,
        book: book || { _id: i.book, title: "Book not found" },
      };
    })
  );
};

// ================================
// GET USER CART
// ================================
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.json({ items: [] });

    const detailedItems = await getCartDetails(cart._id);
    res.json({ cartId: cart._id, items: detailedItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================================
// ADD ONE TO CART
// ================================
export const addToCart = async (req, res) => {
  const { bookId } = req.body;
  try {
    const book = await fetchBookDetails(bookId);
    if (!book) return res.status(404).json({ message: "Book does not exist" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id });

    let item = await CartItem.findOne({ cart: cart._id, book: bookId });
    if (item) {
      item.quantity += 1;
      await item.save();
    } else {
      item = await CartItem.create({ cart: cart._id, book: bookId, quantity: 1 });
    }

    const detailedItems = await getCartDetails(cart._id);
    res.json({ cartId: cart._id, items: detailedItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================================
// REMOVE ONE FROM CART
// ================================
export const removeOneFromCart = async (req, res) => {
  const { bookId } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = await CartItem.findOne({ cart: cart._id, book: bookId });
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity -= 1;
    if (item.quantity <= 0) {
      await item.remove();
    } else {
      await item.save();
    }

    const detailedItems = await getCartDetails(cart._id);
    res.json({ cartId: cart._id, items: detailedItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================================
// REMOVE CART ITEM (by ID)
// ================================
export const removeCartItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const item = await CartItem.findByIdAndDelete(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const items = await CartItem.find({ cart: item.cart });
    const detailedItems = await Promise.all(
      items.map(async (i) => {
        const book = await fetchBookDetails(i.book);
        return {
          _id: i._id,
          quantity: i.quantity,
          price: book ? book.price * i.quantity : 0,
          book: book || { _id: i.book, title: "Book not found" },
        };
      })
    );

    res.json({ cartId: item.cart, items: detailedItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================================
// CLEAR CART — only callable by order-service (service token)
// ================================
export const clearCart = async (req, res) => {
  try {
    const token = req.header("X-Service-Token");
    if (!token || token !== process.env.CART_SERVICE_TOKEN) {
      return res.status(403).json({ message: "Forbidden: invalid service token" });
    }

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required to clear cart" });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await CartItem.deleteMany({ cart: cart._id });

    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
