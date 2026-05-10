import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AnalyticsService, AnalyticsSummary } from './analytics.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

/**
 * AnalyticsComponent – deep analytics dashboard.
 *
 * Displays:
 * - Summary KPI row (with MoM growth indicator)
 * - Revenue trend line chart (12 months)
 * - Order volume bar chart (12 months)
 * - Orders by status doughnut chart
 */
@Component({
  selector: 'app-analytics',
  template: `
    <div class="analytics-page">
      <app-page-header
        title="Analytics"
        subtitle="Business intelligence & performance metrics">
      </app-page-header>

      <!-- Loading state -->
      <app-loading-spinner *ngIf="loading" message="Loading analytics..."></app-loading-spinner>

      <ng-container *ngIf="summary as s">

        <!-- KPI Cards row -->
        <div class="kpi-row">
          <div class="kpi-card">
            <mat-icon class="kpi-icon primary">payments</mat-icon>
            <div class="kpi-body">
              <span class="kpi-label">Revenue This Month</span>
              <span class="kpi-value">{{ s.revenueThisMonth | currency:'MAD':'symbol':'1.0-0' }}</span>
              <span class="kpi-trend" [class.up]="s.revenueGrowthPercent > 0"
                                      [class.down]="s.revenueGrowthPercent < 0">
                <mat-icon>{{ s.revenueGrowthPercent >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                {{ s.revenueGrowthPercent | number:'1.0-0' }}% vs last month
              </span>
            </div>
          </div>

          <div class="kpi-card">
            <mat-icon class="kpi-icon accent">receipt_long</mat-icon>
            <div class="kpi-body">
              <span class="kpi-label">Total Orders</span>
              <span class="kpi-value">{{ s.totalOrders | number }}</span>
            </div>
          </div>

          <div class="kpi-card">
            <mat-icon class="kpi-icon success">people</mat-icon>
            <div class="kpi-body">
              <span class="kpi-label">Total Customers</span>
              <span class="kpi-value">{{ s.totalCustomers | number }}</span>
            </div>
          </div>

          <div class="kpi-card">
            <mat-icon class="kpi-icon warn">inventory_2</mat-icon>
            <div class="kpi-body">
              <span class="kpi-label">Total Products</span>
              <span class="kpi-value">{{ s.totalProducts | number }}</span>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">

          <!-- Revenue Trend -->
          <mat-card class="chart-card flex-2">
            <mat-card-header>
              <mat-card-title>Revenue Trend (12 months)</mat-card-title>
              <mat-card-subtitle>Monthly revenue in MAD</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="revenueChartData"
                [options]="lineOptions"
                type="line">
              </canvas>
            </mat-card-content>
          </mat-card>

          <!-- Orders by Status -->
          <mat-card class="chart-card flex-1">
            <mat-card-header>
              <mat-card-title>Orders by Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="statusChartData"
                [options]="doughnutOptions"
                type="doughnut">
              </canvas>
            </mat-card-content>
          </mat-card>

        </div>

        <!-- Order Volume Chart -->
        <mat-card class="chart-card mt-24">
          <mat-card-header>
            <mat-card-title>Order Volume (12 months)</mat-card-title>
            <mat-card-subtitle>Number of orders per month (excluding cancelled)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="volumeChartData"
              [options]="barOptions"
              type="bar">
            </canvas>
          </mat-card-content>
        </mat-card>

        <!-- Status Table -->
        <mat-card class="mt-24">
          <mat-card-header>
            <mat-card-title>Order Status Breakdown</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="statusRows" class="w-100">
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row">
                  <span class="status-badge" [class]="row.status.toLowerCase()">
                    {{ row.status }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>Count</th>
                <td mat-cell *matCellDef="let row">{{ row.count | number }}</td>
              </ng-container>
              <ng-container matColumnDef="pct">
                <th mat-header-cell *matHeaderCellDef>Share</th>
                <td mat-cell *matCellDef="let row">
                  <div class="bar-wrap">
                    <div class="bar-fill" [style.width.%]="row.pct"></div>
                    <span>{{ row.pct | number:'1.0-1' }}%</span>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['status','count','pct']"></tr>
              <tr mat-row *matRowDef="let r; columns: ['status','count','pct']"></tr>
            </table>
          </mat-card-content>
        </mat-card>

      </ng-container>
    </div>
  `,
  styles: [`
    .analytics-page { padding: 24px; }

    /* KPI row */
    .kpi-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--surface-color); border-radius: 12px; padding: 20px;
      display: flex; gap: 16px; align-items: flex-start; box-shadow: var(--shadow-sm);
    }
    .kpi-icon {
      font-size: 36px; width: 36px; height: 36px; margin-top: 2px;
      &.primary { color: var(--primary-color); }
      &.accent  { color: var(--secondary-color); }
      &.success { color: var(--success-color); }
      &.warn    { color: var(--warning-color); }
    }
    .kpi-body { display: flex; flex-direction: column; }
    .kpi-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; }
    .kpi-value { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 4px 0; }
    .kpi-trend {
      display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600;
      &.up   { color: var(--success-color); }
      &.down { color: var(--error-color); }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* Charts */
    .charts-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .chart-card { flex: 1; min-width: 280px; }
    .flex-1 { flex: 1; min-width: 260px; }
    .flex-2 { flex: 2; min-width: 360px; }
    .mt-24  { margin-top: 24px; }
    .w-100  { width: 100%; }

    /* Status badge */
    .status-badge {
      display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
      &.pending   { background: #fff3e0; color: #e65100; }
      &.confirmed { background: #e3f2fd; color: #0d47a1; }
      &.processing{ background: #f3e5f5; color: #6a1b9a; }
      &.shipped   { background: #e8f5e9; color: #1b5e20; }
      &.delivered { background: #e8f5e9; color: #2e7d32; }
      &.cancelled { background: #ffebee; color: #b71c1c; }
    }

    /* Bar visualization */
    .bar-wrap { display: flex; align-items: center; gap: 8px;
      span { font-size: 12px; min-width: 42px; }
    }
    .bar-fill {
      height: 8px; border-radius: 4px; background: var(--primary-color);
      min-width: 4px; transition: width .5s;
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  loading = true;
  summary: AnalyticsSummary | null = null;

  revenueChartData: ChartData<'line'>     = { labels: [], datasets: [] };
  volumeChartData: ChartData<'bar'>       = { labels: [], datasets: [] };
  statusChartData: ChartData<'doughnut'>  = { labels: [], datasets: [] };
  statusRows: Array<{ status: string; count: number; pct: number }> = [];

  lineOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  barOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  doughnutOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly authService: AuthService,
    private readonly notification: NotificationService,
  ) {}

  ngOnInit(): void {
    const tenantId = this.authService.getTenantId();
    this.analyticsService.getSummary(tenantId).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
        this.buildCharts(data);
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load analytics data');
      },
    });
  }

  private buildCharts(data: AnalyticsSummary): void {
    // Revenue line chart
    this.revenueChartData = {
      labels: Object.keys(data.monthlyRevenue),
      datasets: [{
        data: Object.values(data.monthlyRevenue),
        label: 'Revenue (MAD)',
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63,81,181,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };

    // Volume bar chart
    this.volumeChartData = {
      labels: Object.keys(data.monthlyOrderVolume),
      datasets: [{
        data: Object.values(data.monthlyOrderVolume),
        label: 'Orders',
        backgroundColor: 'rgba(63,81,181,0.7)',
        borderRadius: 6,
      }],
    };

    // Status doughnut
    const STATUS_COLORS = ['#ff9800','#2196f3','#9c27b0','#00bcd4','#4caf50','#f44336'];
    this.statusChartData = {
      labels: Object.keys(data.ordersByStatus),
      datasets: [{
        data: Object.values(data.ordersByStatus),
        backgroundColor: STATUS_COLORS,
      }],
    };

    // Status table rows
    const total = Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0) || 1;
    this.statusRows = Object.entries(data.ordersByStatus).map(([status, count]) => ({
      status, count, pct: (count / total) * 100,
    }));
  }
}
