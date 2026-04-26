import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../core/models/api.model';

export interface StockItem {
  id?: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity?: number;
  reorderLevel: number;
  reorderQuantity: number;
  tenantId?: string;
  lowStock?: boolean;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly base = `${environment.coreApiUrl}/stock`;

  constructor(private http: HttpClient) {}

  getAll(tenantId: string, page = 0, size = 10): Observable<Page<StockItem>> {
    const params = new HttpParams().set('tenantId', tenantId).set('page', page).set('size', size);
    return this.http.get<Page<StockItem>>(this.base, { params });
  }

  getLowStock(tenantId: string): Observable<StockItem[]> {
    return this.http.get<StockItem[]>(`${this.base}/low-stock`, { params: new HttpParams().set('tenantId', tenantId) });
  }

  update(id: number, stock: Partial<StockItem>): Observable<StockItem> {
    return this.http.put<StockItem>(`${this.base}/${id}`, stock);
  }
}
