import Book from "../models/book.model.js";

export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { author: { $regex: query, $options: "i" } }
            ]
        });

        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getBooksByCategory = async (req, res) => {
    try {
        let { category } = req.query;

        if (!category || category.trim() === "") {
            return res.status(400).json({ message: "Category is required" });
        }

        category = category.trim();

        const books = await Book.find({
            category: { $regex: category, $options: "i" } // case-insensitive
        });

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found for this category" });
        }

        res.json(books);

    } catch (error) {
        console.error("getBooksByCategory error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getBookDetail = async (req, res) => {
    try {
        let id = req.params.id;
        id = id.trim();
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
