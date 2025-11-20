import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import {
  LucideAngularModule,
  ShoppingCart,
  BookAIcon,
  Search,
} from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    RouterLinkWithHref,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('frontend');
  readonly ShoppingCart = ShoppingCart;
  readonly Book = BookAIcon;
  readonly Search = Search;
  menuOpen = false;
  searchOpen = false;
  searchQuery = '';

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleSearch() {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) {
      this.searchQuery = '';
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
    }
  }
}
