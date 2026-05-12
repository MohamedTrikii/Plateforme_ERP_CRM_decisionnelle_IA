import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatDividerModule, MatIconModule],
  selector: 'app-sidebar',
  template: `
    <div class="sidebar-container">
      <div class="tenant-block">
        <div class="tenant-name">{{ tenantName }}</div>
        <div class="tenant-id">{{ tenantId }}</div>
      </div>

      <mat-divider></mat-divider>

      <mat-nav-list>
        <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" (click)="onNavigate()">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        <a mat-list-item routerLink="/customers" routerLinkActive="active-link" (click)="onNavigate()">
          <mat-icon matListItemIcon>people</mat-icon>
          <span matListItemTitle>Customers</span>
        </a>
        <a mat-list-item routerLink="/products" routerLinkActive="active-link" (click)="onNavigate()">
          <mat-icon matListItemIcon>inventory_2</mat-icon>
          <span matListItemTitle>Products</span>
        </a>
        <a mat-list-item routerLink="/orders" routerLinkActive="active-link" (click)="onNavigate()">
          <mat-icon matListItemIcon>receipt_long</mat-icon>
          <span matListItemTitle>Orders</span>
        </a>
        <a mat-list-item routerLink="/reports" routerLinkActive="active-link" (click)="onNavigate()">
          <mat-icon matListItemIcon>analytics</mat-icon>
          <span matListItemTitle>Reports</span>
        </a>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--surface-color, #fff);
    }

    .tenant-block {
      padding: 16px;
      line-height: 1.2;
    }

    .tenant-name {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .tenant-id {
      margin-top: 4px;
      color: var(--text-secondary, #666);
      font-size: 0.8rem;
      word-break: break-all;
    }

    .active-link {
      background: rgba(63, 81, 181, 0.12);
      border-left: 3px solid #3f51b5;
    }
  `],
})
export class SidebarComponent implements OnInit {
  @Output() navigate = new EventEmitter<void>();

  tenantName = 'Tenant';
  tenantId = '';

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  ngOnInit(): void {
    this.tenantId = this.authService.getTenantId() ?? '';
    this.tenantName = this.configService.getTenantName() || 'Tenant';
  }

  onNavigate(): void {
    this.navigate.emit();
  }
}
