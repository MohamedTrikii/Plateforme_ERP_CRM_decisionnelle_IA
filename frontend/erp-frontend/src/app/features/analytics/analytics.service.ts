import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AnalyticsSummary {
  totalCustomers:      number;
  totalProducts:       number;
  totalOrders:         number;
  revenueThisMonth:    number;
  revenueLastMonth:    number;
  revenueGrowthPercent:number;
  monthlyRevenue:      Record<string, number>;
  monthlyOrderVolume:  Record<string, number>;
  ordersByStatus:      Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private readonly BASE = `${environment.coreApiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getSummary(tenantId: string): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.BASE}/summary`, { params: { tenantId } });
  }

  getMonthlyRevenue(tenantId: string, months = 12): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.BASE}/revenue`, { params: { tenantId, months } });
  }

  getOrderVolume(tenantId: string, months = 12): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.BASE}/orders/volume`, { params: { tenantId, months } });
  }

  getOrdersByStatus(tenantId: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.BASE}/orders/status`, { params: { tenantId } });
  }
}
