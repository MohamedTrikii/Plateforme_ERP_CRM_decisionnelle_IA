import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  lowStockProductCount: number;
  outOfStockCount: number;
  revenueByMonth: Record<string, number>;
  topProducts: Array<{ productName: string; totalQuantity: number; totalRevenue: number }>;
  ordersByStatus: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly base = `${environment.coreApiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(tenantId: string): Observable<DashboardStats> {
    const params = new HttpParams().set('tenantId', tenantId);
    return this.http.get<DashboardStats>(this.base, { params });
  }
}
