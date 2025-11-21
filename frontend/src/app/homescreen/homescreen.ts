import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { BookService } from '../services/book.service';
import { Router } from '@angular/router';

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

  get books() {
    return this.bookService.books();
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
      quantity: 1,
    });
    // navigate to payment screen
    this.router.navigate(['/payment']);
  }

  private showToast(msg: string, ms = 1800) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), ms);
  }
}
