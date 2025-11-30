import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, of } from 'rxjs';

export interface CartItem {
  _id?: string;
  title: string;
  author?: string;
  genre?: string;
  price: number;
  quantity: number;
  bookId?: string; // Backend book ID
  coverImage?: string; // Book cover image URL
}

interface BackendCartItem {
  _id: string;
  quantity: number;
  price: number;
  book: {
    _id: string;
    title: string;
    author: string;
    category: string;
    price: number;
    coverImage?: string;
    image_url?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = 'https://gateway-service-mddd.onrender.com/v1'; // API Gateway base URL
  private _items = signal<CartItem[]>([]);
  private useBackend = signal<boolean>(false); // Flag to enable backend sync

  readonly items = computed(() => this._items());

  // Enable backend sync (called after successful auth)
  enableBackend() {
    this.useBackend.set(true);
  }

  // Fetch cart from backend (requires auth)
  fetchCart() {
    console.log('[CartService] Fetching cart from backend...');
    this.http
      .get<{ cartId: string; items: BackendCartItem[] }>(
        `${this.apiUrl}/cart`,
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          console.log('[CartService] Backend cart response:', response);
          return response.items.map((item) => ({
            _id: item._id,
            title: item.book.title,
            author: item.book.author,
            genre: item.book.category,
            price: item.book.price,
            quantity: item.quantity,
            bookId: item.book._id,
            coverImage:
              (item.book as any).coverImage || (item.book as any).image_url,
          }));
        }),
        catchError((err) => {
          console.error(
            '[CartService] Failed to fetch cart from backend:',
            err
          );
          this.useBackend.set(false);
          return of([]);
        })
      )
      .subscribe((items) => {
        console.log('[CartService] Fetched items:', items);
        // Enable backend mode if fetch was successful (even if empty)
        this.useBackend.set(true);
        this._items.set(items);
      });
  }

  add(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
    console.log(
      '[CartService] Adding item:',
      item,
      'useBackend:',
      this.useBackend()
    );
    if (this.useBackend() && item.bookId) {
      // Use backend
      console.log('[CartService] Adding to backend cart...');
      this.http
        .post<{ cartId: string; items: BackendCartItem[] }>(
          `${this.apiUrl}/cart/add`,
          { bookId: item.bookId },
          { withCredentials: true }
        )
        .pipe(
          map((response) => {
            console.log('[CartService] Backend add response:', response);
            return response.items.map((i) => ({
              _id: i._id,
              title: i.book.title,
              author: i.book.author,
              genre: i.book.category,
              price: i.book.price,
              quantity: i.quantity,
              bookId: i.book._id,
              coverImage:
                (i.book as any).coverImage || (i.book as any).image_url,
            }));
          }),
          catchError((err) => {
            console.error('[CartService] Backend add failed:', err);
            this.useBackend.set(false);
            return of(null);
          })
        )
        .subscribe((items) => {
          if (items) {
            console.log('[CartService] Cart updated with items:', items);
            this._items.set(items);
          } else {
            this.addLocal(item);
          }
        });
    } else {
      console.log('[CartService] Adding to local cart');
      this.addLocal(item);
    }
  }

  private addLocal(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
    const existing = this._items().find(
      (i) => i.title === item.title && i.price === item.price
    );
    if (existing) {
      this._items.update((list) =>
        list.map((i) =>
          i === existing
            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
            : i
        )
      );
    } else {
      const toAdd: CartItem = {
        ...item,
        quantity: item.quantity ?? 1,
      } as CartItem;
      this._items.update((list) => [...list, toAdd]);
    }
  }

  remove(item: CartItem) {
    if (this.useBackend() && item._id) {
      this.http
        .delete(`${this.apiUrl}/cart/item/${item._id}`, {
          withCredentials: true,
        })
        .pipe(
          catchError((err) => {
            console.warn('Backend remove failed, using local cart:', err);
            this.useBackend.set(false);
            return of(null);
          })
        )
        .subscribe(() => {
          this._items.update((list) => list.filter((i) => i !== item));
        });
    } else {
      this._items.update((list) => list.filter((i) => i !== item));
    }
  }

  increase(item: CartItem) {
    if (this.useBackend() && item.bookId) {
      this.http
        .post<{ cartId: string; items: BackendCartItem[] }>(
          `${this.apiUrl}/cart/add`,
          { bookId: item.bookId },
          { withCredentials: true }
        )
        .pipe(
          map((response) =>
            response.items.map((i) => ({
              _id: i._id,
              title: i.book.title,
              author: i.book.author,
              genre: i.book.category,
              price: i.book.price,
              quantity: i.quantity,
              bookId: i.book._id,
              coverImage:
                (i.book as any).coverImage || (i.book as any).image_url,
            }))
          ),
          catchError(() => of(null))
        )
        .subscribe((items) => {
          if (items) {
            this._items.set(items);
          } else {
            this.increaseLocal(item);
          }
        });
    } else {
      this.increaseLocal(item);
    }
  }

  private increaseLocal(item: CartItem) {
    this._items.update((list) =>
      list.map((i) => (i === item ? { ...i, quantity: i.quantity + 1 } : i))
    );
  }

  decrease(item: CartItem) {
    if (this.useBackend() && item.bookId) {
      this.http
        .post<{ cartId: string; items: BackendCartItem[] }>(
          `${this.apiUrl}/cart/remove`,
          { bookId: item.bookId },
          { withCredentials: true }
        )
        .pipe(
          map((response) =>
            response.items.map((i) => ({
              _id: i._id,
              title: i.book.title,
              author: i.book.author,
              genre: i.book.category,
              price: i.book.price,
              quantity: i.quantity,
              bookId: i.book._id,
              coverImage:
                (i.book as any).coverImage || (i.book as any).image_url,
            }))
          ),
          catchError(() => of(null))
        )
        .subscribe((items) => {
          if (items) {
            this._items.set(items);
          } else {
            this.decreaseLocal(item);
          }
        });
    } else {
      this.decreaseLocal(item);
    }
  }

  private decreaseLocal(item: CartItem) {
    this._items.update((list) =>
      list.map((i) =>
        i === item ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
      )
    );
  }

  clear() {
    this._items.set([]);
  }

  getTotal() {
    return this._items().reduce((acc, it) => acc + it.price * it.quantity, 0);
  }
}
