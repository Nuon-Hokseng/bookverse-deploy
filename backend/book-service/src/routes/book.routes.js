import express from "express";
import {
    getAllBooks,
    searchBooks,
    getBooksByCategory,
    getBookDetail
} from "../controllers/book.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management and retrieval
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 */
router.get("/", getAllBooks);

/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Search books by title or author
 *     tags: [Books]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of books matching the search
 */
router.get("/search", searchBooks);

/**
 * @swagger
 * /books/category:
 *   get:
 *     summary: Get books by category
 *     tags: [Books]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: List of books in the category
 */
router.get("/category", getBooksByCategory);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book details by ID
 *     tags: [Books]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 author:
 *                   type: string
 *                 description:
 *                   type: string
 */
router.get("/:id", getBookDetail);

export default router;
