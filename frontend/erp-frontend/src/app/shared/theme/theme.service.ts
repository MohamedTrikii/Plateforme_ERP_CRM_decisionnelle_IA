import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import { CONFIG_KEYS, ConfigMap } from '../models/system-config.model';

/**
 * ThemeService – applies dynamic branding to the DOM using CSS custom properties.
 *
 * When the ConfigService emits a new config map, ThemeService:
 * 1. Reads color/font/branding values
 * 2. Sets CSS variables on :root via Renderer2
 * 3. Angular Material automatically picks up the CSS variables
 *
 * This approach allows zero-refresh theme switching.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly renderer: Renderer2;

  constructor(
    private readonly configService: ConfigService,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // React to every config update
    this.configService.config$.subscribe(config => {
      this.applyTheme(config);
    });
  }

  private applyTheme(config: ConfigMap): void {
    const root = document.documentElement;

    const primaryColor   = config[CONFIG_KEYS.PRIMARY_COLOR]   || '#1565C0';
    const secondaryColor = config[CONFIG_KEYS.SECONDARY_COLOR] || '#0097A7';
    const accentColor    = config[CONFIG_KEYS.ACCENT_COLOR]    || '#FF6F00';
    const fontFamily     = config[CONFIG_KEYS.FONT_FAMILY]     || 'Roboto, sans-serif';

    // Set CSS custom properties – referenced in styles.scss
    this.renderer.setStyle(root, '--primary-color',   primaryColor,   2);
    this.renderer.setStyle(root, '--secondary-color', secondaryColor, 2);
    this.renderer.setStyle(root, '--accent-color',    accentColor,    2);
    this.renderer.setStyle(root, '--font-family',     fontFamily,     2);

    // Derive lighter shade for sidebar/header backgrounds
    this.renderer.setStyle(root, '--primary-light',
      this.lightenColor(primaryColor, 40), 2);
  }

  /** Get enabled sidebar modules from config */
  getEnabledModules(): string[] {
    const raw = this.configService.get(CONFIG_KEYS.SIDEBAR_MODULES,
      '["dashboard","customers","products","orders","stock"]');
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return ['dashboard', 'customers', 'products', 'orders', 'stock'];
    }
  }

  /** Get company name from config */
  getCompanyName(): string {
    return this.configService.get(CONFIG_KEYS.COMPANY_NAME, 'ERP Platform');
  }

  /** Get logo URL from config */
  getLogoUrl(): string {
    return this.configService.get(CONFIG_KEYS.COMPANY_LOGO_URL, '');
  }

  // ── Color utility ─────────────────────────────────────────────────────────

  /**
   * Lightens a hex color by the given amount.
   * Used to derive background shades from the primary color.
   */
  private lightenColor(hex: string, amount: number): string {
    const num = Number.parseInt(hex.replace('#', ''), 16);
    const r   = Math.min(255, (num >> 16) + amount);
    const g   = Math.min(255, ((num >> 8) & 0x00ff) + amount);
    const b   = Math.min(255, (num & 0x0000ff) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}
