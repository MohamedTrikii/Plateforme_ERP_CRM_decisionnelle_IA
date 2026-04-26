import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { DashboardKpi } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getKpis(from?: string, to?: string): Observable<DashboardKpi> {
    let params = new HttpParams()
      .set('tenantId', this.authService.tenantId);
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to',   to);
    return this.http.get<DashboardKpi>(
      `${environment.apiUrl}/dashboard/kpis`, { params }
    );
  }
}
