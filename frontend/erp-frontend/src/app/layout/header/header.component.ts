import { Component, EventEmitter, Output } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  selector: 'app-header',
  template: `
    <mat-toolbar class="header-toolbar" color="primary">
      <div class="left-group">
        <button mat-icon-button (click)="menuToggle.emit()" matTooltip="Toggle sidebar">
          <mat-icon>menu</mat-icon>
        </button>
        <div class="brand" *ngIf="appName$ | async as appName">{{ appName }}</div>
      </div>

      <div class="right-group">
        <button mat-icon-button (click)="toggleTheme()" matTooltip="Toggle theme">
          <mat-icon>{{ (isDarkMode$ | async) ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Account">
          <mat-icon>account_circle</mat-icon>
        </button>
      </div>
    </mat-toolbar>

    <mat-menu #userMenu="matMenu">
      <button mat-menu-item disabled>
        <mat-icon>badge</mat-icon>
        <span>{{ (authService.currentUser$ | async)?.fullName || 'User' }}</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px;
    }

    .left-group,
    .right-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
  `],
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();

  readonly appName$ = this.configService.appName$;
  readonly isDarkMode$ = this.themeService.isDarkMode$;

  constructor(
    readonly authService: AuthService,
    readonly themeService: ThemeService,
    private readonly configService: ConfigService,
    private readonly router: Router,
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
