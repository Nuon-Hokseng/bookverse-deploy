import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../services/book.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { PopupService } from '../shared/popup.service';
import { Router } from '@angular/router';
import { OrderService, Order } from '../services/order.service';

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
  private adminAuth = inject(AdminAuthService);
  private popup = inject(PopupService);
  private orderService = inject(OrderService);

  books = this.bookService.books;
  loading = this.bookService.loading;
  error = this.bookService.error;
  showAddForm = false;

  // Tabs: 'books' | 'orders'
  activeTab: 'books' | 'orders' = 'books';

  // Orders state
  orders = signal<Order[]>([]);
  ordersLoading = signal<boolean>(false);
  ordersError = signal<string | null>(null);
  savingOrderId = signal<string | null>(null);

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

  adminLogout() {
    this.adminAuth.logout();
    this.popup.show('Logged out of admin', {
      type: 'success',
      durationMs: 1200,
    });
    this.router.navigate(['/admin-login']);
  }

  setTab(tab: 'books' | 'orders') {
    this.activeTab = tab;
    if (tab === 'orders') {
      this.fetchAllOrders();
    }
  }

  private fetchAllOrders() {
    this.ordersLoading.set(true);
    this.ordersError.set(null);
    this.orderService.getAllOrders().subscribe({
      next: (list) => {
        this.orders.set(list || []);
        this.ordersLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch all orders:', err);
        this.ordersError.set('Failed to load orders.');
        this.ordersLoading.set(false);
      },
    });
  }

  onChangeStatus(orderId: string, status: 'pending' | 'success' | 'fail') {
    this.savingOrderId.set(orderId);
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updated) => {
        // Update local list
        this.orders.update((curr) =>
          curr.map((o) =>
            o._id === orderId ? { ...o, status: updated.status } : o
          )
        );
        this.savingOrderId.set(null);
        this.popup.show('Order status updated', {
          type: 'success',
          durationMs: 1200,
        });
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.savingOrderId.set(null);
        this.popup.show('Failed to update order status', {
          type: 'error',
          durationMs: 2200,
        });
      },
    });
  }
}
