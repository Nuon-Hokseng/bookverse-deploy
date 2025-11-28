import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { BookService } from '../services/book.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-homescreen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homescreen.html',
  styleUrls: ['./homescreen.css'],
})
export class Homescreen {
  private cart = inject(CartService);
  private bookService = inject(BookService);
  private router = inject(Router);

  // toast UI state for add-to-cart confirmation
  toastVisible = false;
  toastMessage = '';

  categories = ['All', 'Fiction', 'Classic', 'Mystery', 'Fantasy', 'Romance'];
  selectedCategory = 'All';

  get books() {
    const allBooks = this.bookService.books();
    if (this.selectedCategory === 'All') {
      return allBooks;
    }
    return allBooks.filter((book) => book.genre === this.selectedCategory);
  }

  constructor() {
    this.bookService.fetchBooks();
  }

  addToCart(book: any) {
    this.cart.add({
      title: book.title,
      author: book.author,
      price: book.price,
      genre: book.genre,
      bookId: book._id, // Pass book ID for backend sync
      coverImage: book.coverImage, // Pass cover image URL
    });
    this.showToast(`${book.title} added to cart`);
  }

  purchase(book: any) {
    // add the single item and navigate to payment
    this.cart.add({
      title: book.title,
      author: book.author,
      price: book.price,
      genre: book.genre,
      bookId: book._id, // Pass book ID for backend sync
      coverImage: book.coverImage, // Pass cover image URL
      quantity: 1,
    });
    // navigate to payment screen
    this.router.navigate(['/payment']);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  private showToast(msg: string, ms = 1800) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), ms);
  }
}
