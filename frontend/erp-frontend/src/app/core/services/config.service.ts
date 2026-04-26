import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigMap, CONFIG_KEYS } from '../models/system-config.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

/**
 * ConfigService – loads and caches dynamic system configuration.
 *
 * This is the core of the "template engine" pattern.
 * On startup, the app fetches the public config map from the backend
 * and applies it via the ThemeService.
 *
 * The config map is cached in memory and emitted as a reactive stream
 * so all components can react to config changes in real-time.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {

  private readonly configSubject = new BehaviorSubject<ConfigMap>({});

  /** Reactive config map – subscribe to get live updates */
  config$ = this.configSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  /**
   * Load public config at app startup (called in APP_INITIALIZER).
   * No authentication required – the login page needs branding too.
   */
  loadPublicConfig(): Observable<ConfigMap> {
    const tenantId = this.authService.tenantId || 'default';
    return this.http.get<ConfigMap>(
      `${environment.apiUrl}/config/public?tenantId=${tenantId}`
    ).pipe(
      tap(config => this.configSubject.next(config)),
      catchError(err => {
        console.warn('Could not load system config, using defaults', err);
        return of(this.getDefaultConfig());
      })
    );
  }

  /** Load full config (admin only) */
  loadFullConfig(): Observable<ConfigMap> {
    const tenantId = this.authService.tenantId;
    return this.http.get<ConfigMap>(
      `${environment.apiUrl}/config/map?tenantId=${tenantId}`
    ).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /** Get a single config value synchronously (falls back to default) */
  get(key: string, defaultValue = ''): string {
    return this.configSubject.value[key] ?? defaultValue;
  }

  /** Update the in-memory config and optionally persist to backend */
  updateLocal(updates: ConfigMap): void {
    this.configSubject.next({
      ...this.configSubject.value,
      ...updates,
    });
  }

  /** Persist a bulk config update to backend */
  saveBulk(values: Array<{ configKey: string; configValue: string }>): Observable<void> {
    const tenantId = this.authService.tenantId;
    return this.http.put<void>(
      `${environment.apiUrl}/config/bulk?tenantId=${tenantId}`,
      values
    ).pipe(
      tap(() => {
        const map: ConfigMap = {};
        values.forEach(v => { map[v.configKey] = v.configValue; });
        this.updateLocal(map);
      })
    );
  }

  /** Return current config snapshot (synchronous) */
  getAll(): ConfigMap {
    return this.configSubject.value;
  }

  // ── Defaults ──────────────────────────────────────────────────────────────

  private getDefaultConfig(): ConfigMap {
    return {
      [CONFIG_KEYS.COMPANY_NAME]:     'ERP Platform',
      [CONFIG_KEYS.PRIMARY_COLOR]:    '#1565C0',
      [CONFIG_KEYS.SECONDARY_COLOR]:  '#0097A7',
      [CONFIG_KEYS.ACCENT_COLOR]:     '#FF6F00',
      [CONFIG_KEYS.FONT_FAMILY]:      'Roboto, sans-serif',
      [CONFIG_KEYS.SIDEBAR_MODULES]:  '["dashboard","customers","products","orders","stock"]',
    };
  }
}
