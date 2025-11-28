import { Routes } from '@angular/router';
import { Homescreen } from './homescreen/homescreen';
import { Cart } from './cart/cart';
import { About } from './about/about';
import { Payment } from './payment/payment';
import { Admin } from './admin/admin';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Homescreen },
  { path: 'cart', component: Cart },
  { path: 'payment', component: Payment },
  { path: 'about', component: About },
  { path: 'admin', component: Admin },
  { path: '**', redirectTo: 'home' },
];
