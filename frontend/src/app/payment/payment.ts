import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
})
export class Payment {
  name = '';
  address = '';
  cardNumber = '';
  exp = '';
  cvv = '';
  notes = '';

  private cart = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  get items() {
    return this.cart.items();
  }

  getTotal() {
    return this.cart.getTotal();
  }

  pay() {
    const order = {
      customer: {
        name: this.name,
        address: this.address,
        card: this.cardNumber
      },
      items: this.cart.items(),
      total: this.getTotal()
    };

    this.orderService.createOrder(order).subscribe({
      next: () => {
        alert(`Payment successful! Order created for ${this.name}`);
        this.cart.clear();
        this.router.navigate(['/']);
      },
      error: (err) => {
        alert('Payment failed. Please try again.');
        console.error(err);
      }
    });
  }
}
