import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    publication_year: { type: Number },
    description: { type: String },
    image_url: { type: String },
    category: { type: String },   // just store category as string
    price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);
