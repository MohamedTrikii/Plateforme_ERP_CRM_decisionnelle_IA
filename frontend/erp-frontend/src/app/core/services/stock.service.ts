import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Stock } from '../models/product.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class StockService {

  private base = `${environment.apiUrl}/stock`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get tenantId(): string { return this.auth.tenantId; }

  getAll(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('tenantId', this.tenantId);
    return this.http.get<any>(this.base, { params });
  }

  upsert(productId: number, stock: Partial<Stock>): Observable<Stock> {
    return this.http.put<Stock>(`${this.base}/${productId}`, { ...stock, tenantId: this.tenantId });
  }
}
