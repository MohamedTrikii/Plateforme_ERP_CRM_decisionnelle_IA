import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

/**
 * ThemeService – applies dynamic branding from tenant SystemConfig.
 *
 * Called at startup with the config map from ConfigService.
 * Sets CSS custom properties on :root so all components react automatically.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {

  private renderer: Renderer2;
  private themeModeSubject = new BehaviorSubject<ThemeMode>('light');
  themeMode$ = this.themeModeSubject.asObservable();

  // CSS variable mapping: config key → CSS variable name
  private readonly COLOR_MAP: Record<string, string> = {
    'theme.primaryColor':   '--primary-color',
    'theme.secondaryColor': '--secondary-color',
    'theme.backgroundColor':'--background-color',
    'theme.surfaceColor':   '--surface-color',
    'theme.textPrimary':    '--text-primary',
  };

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Apply all CSS variables from the tenant config map.
   * Called once after ConfigService loads the public config.
   */
  applyConfig(config: Record<string, string>): void {
    const root = document.documentElement;

    Object.entries(this.COLOR_MAP).forEach(([key, cssVar]) => {
      if (config[key]) {
        root.style.setProperty(cssVar, config[key]);
      }
    });

    // Apply dark/light preference if configured
    const darkMode = config['theme.darkMode'];
    if (darkMode === 'true') {
      this.setDarkMode(true);
    }
  }

  /** Toggle between light and dark mode */
  toggleTheme(): void {
    const isDark = this.themeModeSubject.value === 'dark';
    this.setDarkMode(!isDark);
  }

  setDarkMode(dark: boolean): void {
    const body = document.body;
    if (dark) {
      this.renderer.addClass(body, 'dark-theme');
      this.themeModeSubject.next('dark');
    } else {
      this.renderer.removeClass(body, 'dark-theme');
      this.themeModeSubject.next('light');
    }
    localStorage.setItem('erp_theme', dark ? 'dark' : 'light');
  }

  /** Restore theme preference from localStorage on app init */
  restoreTheme(): void {
    const saved = localStorage.getItem('erp_theme');
    if (saved === 'dark') this.setDarkMode(true);
  }
}
