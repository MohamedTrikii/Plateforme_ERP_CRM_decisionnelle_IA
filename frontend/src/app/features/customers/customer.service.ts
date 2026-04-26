import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../core/models/api.model';

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  tenantId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly base = `${environment.coreApiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAll(tenantId: string, page = 0, size = 10, search?: string): Observable<Page<Customer>> {
    let params = new HttpParams().set('tenantId', tenantId).set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<Page<Customer>>(this.base, { params });
  }

  getById(id: number, tenantId: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/${id}`, { params: new HttpParams().set('tenantId', tenantId) });
  }

  create(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.base, customer);
  }

  update(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.base}/${id}`, customer);
  }

  delete(id: number, tenantId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { params: new HttpParams().set('tenantId', tenantId) });
  }
}
