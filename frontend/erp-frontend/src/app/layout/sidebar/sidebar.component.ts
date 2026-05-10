import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Array<'ADMIN' | 'MANAGER' | 'USER'>;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar-wrapper">

      <!-- Logo section -->
      <div class="sidebar-logo">
        <img [src]="logoUrl" alt="Logo" class="logo-img" onerror="this.style.display='none'">
        <span class="logo-text">{{ companyName }}</span>
      </div>

      <mat-divider></mat-divider>

      <!-- Navigation list -->
      <mat-nav-list class="nav-list">
        <ng-container *ngFor="let item of visibleNavItems">
          <a mat-list-item
             [routerLink]="item.route"
             routerLinkActive="active-link"
             [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
             (click)="closeSidenav.emit()">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        </ng-container>
      </mat-nav-list>

      <div class="sidebar-footer">
        <mat-divider></mat-divider>
        <div class="tenant-badge">
          <mat-icon>business</mat-icon>
          <span>{{ tenantId }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-wrapper { display: flex; flex-direction: column; height: 100%; }
    .sidebar-logo {
      display: flex; align-items: center; gap: 10px; padding: 20px 16px 16px;
      .logo-img  { height: 36px; max-width: 36px; object-fit: contain; }
      .logo-text { font-weight: 700; font-size: 17px; color: var(--primary-color); }
    }
    .nav-list { flex: 1; padding: 8px 0; }
    a[mat-list-item] {
      border-radius: 8px; margin: 2px 8px; height: 44px;
      color: var(--text-secondary); font-weight: 500; font-size: 14px;
      &.active-link {
        background: #e8eaf6; color: var(--primary-color);
        mat-icon { color: var(--primary-color); }
      }
      &:hover:not(.active-link) { background: #f5f5f5; color: var(--text-primary); }
    }
    .sidebar-footer { padding: 8px 0; }
    .tenant-badge {
      display: flex; align-items: center; gap: 8px; padding: 12px 16px;
      font-size: 12px; color: var(--text-secondary);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();

  companyName = 'ERP Platform';
  logoUrl     = 'assets/images/default-logo.svg';
  tenantId    = '';

  private readonly ALL_NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',        route: '/app/dashboard' },
    { label: 'Customers',  icon: 'people',            route: '/app/customers' },
    { label: 'Products',   icon: 'inventory_2',       route: '/app/products' },
    { label: 'Orders',     icon: 'receipt_long',      route: '/app/orders' },
    { label: 'Stock',      icon: 'warehouse',         route: '/app/stock' },
    { label: 'Analytics',  icon: 'bar_chart',         route: '/app/analytics',  roles: ['ADMIN', 'MANAGER'] },
    { label: 'Admin',      icon: 'settings',          route: '/app/admin',      roles: ['ADMIN'] },
    { label: 'Audit Logs', icon: 'history',           route: '/app/audit',      roles: ['ADMIN', 'MANAGER'] },
  ];

  visibleNavItems: NavItem[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.tenantId    = user?.tenantId ?? '';
    this.companyName = this.configService.getCompanyName();
    this.logoUrl     = this.configService.getLogoUrl();

    // Filter nav items by role
    this.visibleNavItems = this.ALL_NAV_ITEMS.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(user?.role ?? 'USER');
    });

    // Re-apply when config loads
    this.configService.config$.subscribe(() => {
      this.companyName = this.configService.getCompanyName();
      this.logoUrl     = this.configService.getLogoUrl();
    });
  }
}
