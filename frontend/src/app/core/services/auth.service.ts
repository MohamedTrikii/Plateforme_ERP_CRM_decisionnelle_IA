import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

/**
 * AuthService – handles authentication state, JWT storage and current user.
 *
 * JWT is stored in localStorage (access token) and sessionStorage (refresh).
 * A BehaviorSubject exposes the current user to all components reactively.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly AUTH_URL    = `${environment.authApiUrl}/auth`;
  private readonly TOKEN_KEY   = 'erp_access_token';
  private readonly REFRESH_KEY = 'erp_refresh_token';
  private readonly USER_KEY    = 'erp_current_user';

  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.loadStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  // ── Login ─────────────────────────────────────────────────────────────────

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  // ── Register ──────────────────────────────────────────────────────────────

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.REFRESH_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ── Token helpers ─────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  isManagerOrAbove(): boolean {
    const role = this.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  }

  getTenantId(): string {
    return this.getCurrentUser()?.tenantId ?? environment.defaultTenantId;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(this.REFRESH_KEY, response.refreshToken);

    // Reconstruct a User object from the token response
    const user: User = {
      id: 0,
      username: response.username,
      email: '',
      fullName: response.username,
      role: response.role.replace('ROLE_', '') as User['role'],
      tenantId: response.tenantId,
      enabled: true,
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
