import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export interface Book {
    _id: string;
    title: string;
    author: string;
    price: number;
    genre: string;
    description?: string;
    coverImage?: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/books'; // Gateway URL

    books = signal<Book[]>([]);

    fetchBooks() {
        this.http.get<Book[]>(this.apiUrl).subscribe({
            next: (data) => this.books.set(data),
            error: (err) => console.error('Failed to fetch books', err),
        });
    }
}
