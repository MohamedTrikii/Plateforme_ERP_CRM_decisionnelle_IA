import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private base = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get tenantId(): string { return this.auth.tenantId; }

  getAll(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('tenantId', this.tenantId);
    return this.http.get<any>(this.base, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}?tenantId=${this.tenantId}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.base, { ...product, tenantId: this.tenantId });
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, { ...product, tenantId: this.tenantId });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}?tenantId=${this.tenantId}`);
  }
}
