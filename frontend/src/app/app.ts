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
  // auth / modal state
  LoginOpen = false;
  // Login form bindings
  loginEmail = '';
  loginPassword = '';
  // Auth tab state
  authTab: 'login' | 'signup' = 'login';
  // Signup form bindings
  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirm = '';
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

  toggleLogin() {
    this.LoginOpen = !this.LoginOpen;
  }

  setAuthTab(tab: 'login' | 'signup') {
    this.authTab = tab;
  }

  onLogin() {
    console.log('Login attempt', { email: this.loginEmail });
    this.LoginOpen = false;
    this.loginEmail = '';
    this.loginPassword = '';
  }

  onSignup() {
    console.log('Signup attempt', {
      name: this.signupName,
      email: this.signupEmail,
    });
    this.LoginOpen = false;
    this.signupName = '';
    this.signupEmail = '';
    this.signupPassword = '';
    this.signupConfirm = '';
    this.authTab = 'login';
  }
}
