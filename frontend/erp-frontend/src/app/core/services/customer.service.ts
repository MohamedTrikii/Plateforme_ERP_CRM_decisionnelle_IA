import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerPage } from '../models/customer.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CustomerService {

  private url = `${environment.apiUrl}/customers`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAll(page = 0, size = 20, search?: string): Observable<CustomerPage> {
    let params = new HttpParams()
      .set('tenantId', this.authService.tenantId)
      .set('page', page)
      .set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<CustomerPage>(this.url, { params });
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(
      `${this.url}/${id}`,
      { params: { tenantId: this.authService.tenantId } }
    );
  }

  create(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.url,
      { ...customer, tenantId: this.authService.tenantId });
  }

  update(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.url}/${id}`, customer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${id}`,
      { params: { tenantId: this.authService.tenantId } }
    );
  }

  count(): Observable<number> {
    return this.http.get<number>(
      `${this.url}/count`,
      { params: { tenantId: this.authService.tenantId } }
    );
  }
}
