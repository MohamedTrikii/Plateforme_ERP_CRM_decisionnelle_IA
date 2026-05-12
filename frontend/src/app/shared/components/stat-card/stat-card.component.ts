import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * StatCardComponent – KPI card for the dashboard.
 * Displays an icon, title, value, and optional trend indicator.
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stat-card" [class.accent]="color === 'accent'"
              [class.success]="color === 'success'" [class.warn]="color === 'warn'">
      <mat-card-content>
        <div class="stat-header">
          <div class="stat-icon">
            <mat-icon>{{ icon }}</mat-icon>
          </div>
          <div class="stat-trend" *ngIf="trend !== undefined">
            <mat-icon class="trend-icon"
              [class.up]="trend >= 0" [class.down]="trend < 0">
              {{ trend >= 0 ? 'trending_up' : 'trending_down' }}
            </mat-icon>
            <span [class.up]="trend >= 0" [class.down]="trend < 0">
              {{ trend >= 0 ? '+' : '' }}{{ trend }}%
            </span>
          </div>
        </div>
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stat-card {
      border-radius: var(--border-radius) !important;
      box-shadow: var(--shadow-sm) !important;
      border-left: 4px solid var(--primary-color);
      transition: box-shadow .2s, transform .2s;
      cursor: default;

      &:hover { box-shadow: var(--shadow-md) !important; transform: translateY(-2px); }
      &.accent { border-left-color: var(--secondary-color); .stat-icon { background: #fce4ec; color: var(--secondary-color); } }
      &.success { border-left-color: var(--success-color); .stat-icon { background: #e8f5e9; color: var(--success-color); } }
      &.warn   { border-left-color: var(--warning-color); .stat-icon { background: #fff8e1; color: var(--warning-color); } }
    }
    .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: #e8eaf6; display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 24px; color: var(--primary-color); }
    }
    .stat-trend { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; }
    .up   { color: #4caf50; }
    .down { color: #f44336; }
    .stat-value { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
    .stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; font-weight: 500; }
  `]
})
export class StatCardComponent {
  @Input() label   = '';
  @Input() value: string | number = 0;
  @Input() icon    = 'info';
  @Input() color: 'primary' | 'accent' | 'success' | 'warn' = 'primary';
  @Input() trend?: number;   // % change vs last period
}
