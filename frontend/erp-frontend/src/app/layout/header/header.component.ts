import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ConfigService } from '../../core/services/config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar class="app-header">
      <!-- Toggle sidebar -->
      <button mat-icon-button (click)="toggleSidenav.emit()" class="menu-btn">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Company name / logo -->
      <span class="company-name">{{ companyName }}</span>

      <span class="flex-spacer"></span>

      <!-- Theme toggle -->
      <button mat-icon-button (click)="themeService.toggleTheme()"
              [matTooltip]="(themeService.themeMode$ | async) === 'dark' ? 'Switch to light' : 'Switch to dark'">
        <mat-icon>{{ (themeService.themeMode$ | async) === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <!-- User menu -->
      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <div class="user-menu-header" mat-menu-item disabled>
          <strong>{{ (authService.currentUser$ | async)?.username }}</strong>
          <br>
          <small>{{ (authService.currentUser$ | async)?.role }}</small>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      height: var(--header-height);
      background: var(--surface-color) !important;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary) !important;
      position: sticky; top: 0; z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .company-name { font-weight: 700; font-size: 18px; color: var(--primary-color); margin-left: 4px; }
    .flex-spacer  { flex: 1; }
    .menu-btn     { margin-right: 8px; }
    .user-menu-header { padding: 8px 16px; line-height: 1.6; }
  `]
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  companyName: string;

  constructor(
    readonly authService: AuthService,
    readonly themeService: ThemeService,
    private configService: ConfigService,
    private router: Router,
  ) {
    this.companyName = this.configService.getCompanyName();
    this.configService.config$.subscribe(() => {
      this.companyName = this.configService.getCompanyName();
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
