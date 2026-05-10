import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ThemeService } from './theme.service';

/**
 * ConfigService – loads and caches the tenant's public SystemConfig.
 *
 * The config map drives:
 * - Dynamic branding (colors, logo, company name)
 * - Enabled modules (sidebar items)
 * - Any UI labels or texts
 *
 * Cached in memory; refresh by calling loadConfig() again.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {

  private readonly BASE_URL = `${environment.coreApiUrl}/config`;

  private readonly configSubject = new BehaviorSubject<Record<string, string>>({});
  config$ = this.configSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly themeService: ThemeService,
  ) {}

  /** Load public config for a tenant and apply the theme. */
  loadPublicConfig(tenantId: string): Observable<Record<string, string>> {
    return this.http
      .get<Record<string, string>>(`${this.BASE_URL}/public`, { params: { tenantId } })
      .pipe(
        tap(config => {
          this.configSubject.next(config);
          this.themeService.applyConfig(config);
        })
      );
  }

  /** Load full config (admin only). */
  loadFullConfig(tenantId: string): Observable<Record<string, string>> {
    return this.http
      .get<Record<string, string>>(`${this.BASE_URL}`, { params: { tenantId } })
      .pipe(tap(config => this.configSubject.next(config)));
  }

  /** Get a single config value (sync, from cache). */
  get(key: string, fallback = ''): string {
    return this.configSubject.value[key] ?? fallback;
  }

  /** Get the company name for this tenant */
  getCompanyName(): string {
    return this.get('company.name', 'ERP Platform');
  }

  /** Get the company logo URL */
  getLogoUrl(): string {
    return this.get('company.logoUrl', 'assets/images/default-logo.svg');
  }

  /** Get enabled module slugs (JSON array stored as string) */
  getEnabledModules(): string[] {
    try {
      const raw = this.get('modules.enabled', '["dashboard","customers","products","orders","stock"]');
      return JSON.parse(raw) as string[];
    } catch {
      return ['dashboard', 'customers', 'products', 'orders', 'stock'];
    }
  }

  getCurrentConfig(): Record<string, string> {
    return this.configSubject.value;
  }

  /** Get all config values (alias for getCurrentConfig) */
  getAll(): Record<string, string> {
    return this.configSubject.value;
  }

  /** Save multiple config entries (admin only) */
  saveBulk(updates: Array<{ configKey: string; configValue: string }>): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/bulk`, updates).pipe(
      tap(() => {
        // Update local cache
        const currentConfig = { ...this.configSubject.value };
        updates.forEach(({ configKey, configValue }) => {
          currentConfig[configKey] = configValue;
        });
        this.configSubject.next(currentConfig);
        this.themeService.applyConfig(currentConfig);
      })
    );
  }
}
