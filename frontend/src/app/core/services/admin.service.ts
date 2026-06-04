import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/api.model';

export interface AuditLog {
  id: number;
  entityName: string;
  entityId?: string;
  action: string;
  performedBy?: string;
  tenantId?: string;
  description?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  tenantId?: string;
  enabled: boolean;
  createdAt?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly auditBase = `${environment.coreApiUrl}/audit`;
  private readonly configBase = `${environment.coreApiUrl}/config`;
  private readonly usersBase = `${environment.authApiUrl}/users`;

  constructor(private http: HttpClient) {}

  listAuditLogs(tenantId: string, page = 0, size = 10): Observable<Page<AuditLog>> {
    const params = new HttpParams().set('tenantId', tenantId).set('page', page).set('size', size);
    return this.http.get<Page<AuditLog>>(this.auditBase, { params });
  }

  listAuditLogsByEntity(tenantId: string, entityName: string, page = 0, size = 10): Observable<Page<AuditLog>> {
    const params = new HttpParams().set('tenantId', tenantId).set('page', page).set('size', size);
    return this.http.get<Page<AuditLog>>(`${this.auditBase}/entity/${encodeURIComponent(entityName)}`, { params });
  }

  listUsers(tenantId: string, page = 0, size = 10): Observable<Page<AdminUser>> {
    const params = new HttpParams().set('tenantId', tenantId).set('page', page).set('size', size);
    return this.http.get<Page<AdminUser>>(this.usersBase, { params });
  }

  changeUserRole(userId: number, role: UserRole): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.usersBase}/${userId}/role`, { role });
  }

  toggleUserActive(userId: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.usersBase}/${userId}/toggle-active`, {});
  }

  getConfigMap(tenantId: string): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.configBase}/map`, { params: { tenantId } });
  }

  saveConfigMap(tenantId: string, values: Record<string, string>): Observable<void> {
    return this.http.put<void>(`${this.configBase}/bulk`, values, { params: { tenantId } });
  }
}
