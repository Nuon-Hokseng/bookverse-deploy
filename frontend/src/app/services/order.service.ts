import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private http = inject(HttpClient);
    private apiUrl = '/api/orders';

    createOrder(orderData: any) {
        return this.http.post(this.apiUrl, orderData);
    }
}
