import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../core/models/api.model';

export interface Product {
  id?: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice?: number;
  category?: string;
  imageUrl?: string;
  tenantId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = `${environment.coreApiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(tenantId: string, page = 0, size = 10, search?: string): Observable<Page<Product>> {
    let params = new HttpParams().set('tenantId', tenantId).set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<Page<Product>>(this.base, { params });
  }

  getById(id: number, tenantId: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`, { params: new HttpParams().set('tenantId', tenantId) });
  }

  getCategories(tenantId: string): Observable<string[]> {
    return this.getAll(tenantId, 0, 500).pipe(
      map((page) => {
        const categories = page.content
          .map((product) => product.category?.trim() ?? '')
          .filter((category) => category.length > 0);
        return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
      })
    );
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  delete(id: number, tenantId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { params: new HttpParams().set('tenantId', tenantId) });
  }
}
