import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService, DashboardStats } from './dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-page" *ngIf="!loading; else spinner">
      <app-page-header title="Dashboard" subtitle="Your business at a glance"></app-page-header>

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="stats">
        <app-stat-card label="Total Customers" [value]="stats.totalCustomers"
          icon="people" color="primary" [trend]="0"></app-stat-card>
        <app-stat-card label="Total Orders" [value]="stats.totalOrders"
          icon="receipt_long" color="accent"></app-stat-card>
        <app-stat-card label="Revenue (This Month)"
          [value]="(stats.revenueThisMonth | currency:'MAD':'symbol':'1.0-0') || '0'"
          icon="payments" color="success" [trend]="revenueGrowth"></app-stat-card>
        <app-stat-card label="Low Stock Items" [value]="stats.lowStockProductCount"
          icon="warning" color="warn"></app-stat-card>
      </div>

      <!-- Charts row -->
      <div class="charts-row" *ngIf="stats">

        <!-- Revenue Line Chart -->
        <mat-card class="chart-card flex-2">
          <mat-card-header>
            <mat-card-title>Revenue (Last 6 Months)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="revenueChartData"
              [options]="lineChartOptions"
              type="line">
            </canvas>
          </mat-card-content>
        </mat-card>

        <!-- Orders by Status Doughnut -->
        <mat-card class="chart-card flex-1">
          <mat-card-header>
            <mat-card-title>Orders by Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="orderStatusChartData"
              [options]="doughnutOptions"
              type="doughnut">
            </canvas>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- Low Stock Alert + Top Products -->
      <div class="bottom-row" *ngIf="stats">

        <!-- Top Products -->
        <mat-card class="flex-1">
          <mat-card-header>
            <mat-card-title>Top Products</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="stats.topProducts" class="w-100">
              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let p">{{ p.productName }}</td>
              </ng-container>
              <ng-container matColumnDef="totalQuantity">
                <th mat-header-cell *matHeaderCellDef>Qty Sold</th>
                <td mat-cell *matCellDef="let p">{{ p.totalQuantity }}</td>
              </ng-container>
              <ng-container matColumnDef="totalRevenue">
                <th mat-header-cell *matHeaderCellDef>Revenue</th>
                <td mat-cell *matCellDef="let p">{{ p.totalRevenue | currency:'MAD':'symbol':'1.0-0' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['productName','totalQuantity','totalRevenue']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['productName','totalQuantity','totalRevenue']"></tr>
            </table>
            <app-empty-state *ngIf="!stats.topProducts?.length" icon="bar_chart"
              title="No sales data" message="Orders will appear here once delivered"></app-empty-state>
          </mat-card-content>
        </mat-card>

        <!-- Quick Stats -->
        <mat-card class="flex-1">
          <mat-card-header><mat-card-title>Order Summary</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="summary-item" *ngFor="let s of orderSummary">
              <span class="summary-label">{{ s.label }}</span>
              <span class="summary-value" [class]="s.cls">{{ s.value }}</span>
            </div>
          </mat-card-content>
        </mat-card>

      </div>
    </div>

    <ng-template #spinner>
      <app-loading-spinner message="Loading dashboard..."></app-loading-spinner>
    </ng-template>
  `,
  styles: [`
    .dashboard-page { padding: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .charts-row, .bottom-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .chart-card { flex: 1; min-width: 280px; }
    .flex-1 { flex: 1; min-width: 280px; }
    .flex-2 { flex: 2; min-width: 360px; }
    .summary-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--border-color);
      &:last-child { border-bottom: none; }
    }
    .summary-label { color: var(--text-secondary); font-size: 14px; }
    .summary-value { font-weight: 700; font-size: 16px; }
    .pending   { color: #ff9800; }
    .confirmed { color: #2196f3; }
    .delivered { color: #4caf50; }
    .cancelled { color: #f44336; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats?: DashboardStats;
  revenueGrowth = 0;
  orderSummary: Array<{ label: string; value: number; cls: string }> = [];

  revenueChartData: ChartData<'line'> = { labels: [], datasets: [] };
  orderStatusChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  doughnutOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    const tenantId = this.authService.getTenantId() ?? '';
    this.dashboardService.getStats(tenantId).subscribe({
      next: (data) => {
        this.stats   = data;
        this.loading = false;
        this.buildCharts(data);
        this.buildSummary(data);
        this.revenueGrowth = data.revenueLastMonth > 0
          ? Math.round(((data.revenueThisMonth - data.revenueLastMonth) / data.revenueLastMonth) * 100)
          : 0;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load dashboard data');
      },
    });
  }

  private buildCharts(data: DashboardStats): void {
    const months = Object.keys(data.revenueByMonth);
    const values = Object.values(data.revenueByMonth);
    this.revenueChartData = {
      labels: months,
      datasets: [{
        data: values,
        label: 'Revenue',
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63,81,181,0.1)',
        fill: true,
        tension: 0.4,
      }],
    };

    const statuses = Object.keys(data.ordersByStatus);
    const counts   = Object.values(data.ordersByStatus);
    this.orderStatusChartData = {
      labels: statuses,
      datasets: [{
        data: counts,
        backgroundColor: ['#ff9800', '#2196f3', '#4caf50', '#f44336'],
      }],
    };
  }

  private buildSummary(data: DashboardStats): void {
    this.orderSummary = [
      { label: 'Pending',   value: data.pendingOrders,   cls: 'pending' },
      { label: 'Confirmed', value: (data.ordersByStatus['CONFIRMED'] ?? 0), cls: 'confirmed' },
      { label: 'Delivered', value: data.deliveredOrders, cls: 'delivered' },
      { label: 'Cancelled', value: (data.ordersByStatus['CANCELLED'] ?? 0), cls: 'cancelled' },
    ];
  }
}
