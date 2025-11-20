import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import axios from "axios";

const BOOK_SERVICE_URL = "http://localhost:3000/api/books";

// ================================
// Helper: fetch book details
// ================================
const fetchBookDetails = async (bookId) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_URL}/${bookId}`);
    return response.data;
  } catch (err) {
    return null;
  }
};

// ================================
// Helper: get cart details with price
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
export const removeCartItem = async (req, res) => { const { itemId } = req.params; try { const item = await CartItem.findByIdAndDelete(itemId); if (!item) return res.status(404).json({ message: "Item not found" }); const items = await CartItem.find({ cart: item.cart }); const detailedItems = await Promise.all( items.map(async (i) => { const book = await fetchBookDetails(i.book); const price = book ? book.price * i.quantity : 0; return { _id: i._id, quantity: i.quantity, price, book: book || { _id: i.book, title: "Book not found" }, }; }) ); res.json({ cartId: item.cart, items: detailedItems }); } catch (err) { res.status(500).json({ message: err.message }); } };