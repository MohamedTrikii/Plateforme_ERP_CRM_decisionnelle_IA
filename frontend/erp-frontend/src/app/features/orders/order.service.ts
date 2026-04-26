import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../core/models/api.model';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface Order {
  id?: number;
  orderNumber?: string;
  customerId: number;
  customerName?: string;
  orderDate?: string;
  status?: OrderStatus;
  items: OrderItem[];
  totalAmount?: number;
  notes?: string;
  tenantId?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = `${environment.coreApiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getAll(tenantId: string, page = 0, size = 10): Observable<Page<Order>> {
    const params = new HttpParams().set('tenantId', tenantId).set('page', page).set('size', size);
    return this.http.get<Page<Order>>(this.base, { params });
  }

  getById(id: number, tenantId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`, { params: new HttpParams().set('tenantId', tenantId) });
  }

  create(order: Order): Observable<Order> {
    return this.http.post<Order>(this.base, order);
  }

  updateStatus(id: number, tenantId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/status`, { tenantId, status });
  }
}
