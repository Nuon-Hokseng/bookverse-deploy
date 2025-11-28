import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../services/book.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin {
  bookService = inject(BookService);
  private router = inject(Router);

  books = this.bookService.books;
  loading = this.bookService.loading;
  error = this.bookService.error;
  showAddForm = false;

  newBook = {
    title: '',
    author: '',
    price: 0,
    genre: 'Fiction',
    description: '',
    coverImage: '',
  };

  genres = [
    'Fiction',
    'Classic',
    'Mystery',
    'Fantasy',
    'Romance',
    'Science Fiction',
    'Horror',
    'Biography',
  ];

  constructor() {
    // Fetch books when admin page loads
    this.bookService.fetchBooks();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addBook() {
    if (
      !this.newBook.title ||
      !this.newBook.author ||
      this.newBook.price <= 0
    ) {
      alert('Please fill in all required fields (title, author, price)');
      return;
    }

    // Map frontend fields to backend fields
    const bookData: any = {
      title: this.newBook.title,
      author: this.newBook.author,
      price: this.newBook.price,
      category: this.newBook.genre, // Backend uses 'category' instead of 'genre'
      description: this.newBook.description,
      image_url: this.newBook.coverImage, // Backend uses 'image_url' instead of 'coverImage'
    };

    this.bookService.addBook(bookData).subscribe({
      next: (book) => {
        console.log('Book added successfully:', book);
        alert(`Book "${book.title}" added successfully!`);
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to add book:', err);
        alert('Failed to add book. Make sure the backend is running.');
      },
    });
  }

  deleteBook(book: Book) {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }

    this.bookService.deleteBook(book._id).subscribe({
      next: () => {
        console.log('Book deleted successfully');
        alert(`Book "${book.title}" deleted successfully!`);
      },
      error: (err) => {
        console.error('Failed to delete book:', err);
        alert('Failed to delete book. Make sure the backend is running.');
      },
    });
  }

  resetForm() {
    this.newBook = {
      title: '',
      author: '',
      price: 0,
      genre: 'Fiction',
      description: '',
      coverImage: '',
    };
    this.showAddForm = false;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
