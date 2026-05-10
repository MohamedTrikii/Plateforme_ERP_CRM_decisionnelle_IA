import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

/**
 * AuthService – manages authentication state throughout the app.
 *
 * Responsibilities:
 * - Login / register API calls
 * - JWT storage in localStorage
 * - Reactive currentUser$ stream
 * - Token extraction (role, tenantId)
 * - Logout and route protection
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY   = 'erp_access_token';
  private readonly REFRESH_KEY = 'erp_refresh_token';
  private readonly USER_KEY    = 'erp_user';

  private readonly currentUserSubject = new BehaviorSubject<Partial<AuthResponse> | null>(
    this.loadStoredUser()
  );

  /** Emits whenever the logged-in user changes */
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  // ── Login ─────────────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.authApiUrl}/auth/login`, credentials
    ).pipe(
      tap(response => this.storeAuthData(response))
    );
  }

  // ── Register ──────────────────────────────────────────────────────────────

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.authApiUrl}/auth/register`, data
    ).pipe(
      tap(response => this.storeAuthData(response))
    );
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ── Token accessors ───────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // ── Current user accessors ────────────────────────────────────────────────

  get currentUser(): Partial<AuthResponse> | null {
    return this.currentUserSubject.value;
  }

  get tenantId(): string {
    return this.currentUser?.tenantId ?? '';
  }

  get role(): string {
    return this.currentUser?.role ?? '';
  }

  isAdmin(): boolean     { return this.role === 'ROLE_ADMIN'; }
  isManager(): boolean   { return this.role === 'ROLE_MANAGER'; }

  // ── Private helpers ───────────────────────────────────────────────────────

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY,   response.accessToken);
    localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY,    JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  private loadStoredUser(): Partial<AuthResponse> | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Partial<AuthResponse>;
    } catch {
      return null;
    }
  }

  /**
   * Decode JWT payload (base64) and check the expiry claim.
   * No library needed – JWT payload is just base64-encoded JSON.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
