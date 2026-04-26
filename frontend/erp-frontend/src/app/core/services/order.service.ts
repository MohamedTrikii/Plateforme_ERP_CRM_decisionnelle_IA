import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {

  private base = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get tenantId(): string { return this.auth.tenantId; }

  getAll(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('tenantId', this.tenantId);
    return this.http.get<any>(this.base, { params });
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}?tenantId=${this.tenantId}`);
  }

  create(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.base, { ...order, tenantId: this.tenantId });
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/status`, { status, tenantId: this.tenantId });
  }
}
