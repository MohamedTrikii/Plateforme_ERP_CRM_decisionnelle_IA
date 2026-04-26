import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Order, OrderService, OrderStatus } from '../order.service';
import { OrderDetailDialogComponent } from '../order-detail-dialog/order-detail-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-orders-list',
  template: `
    <div class="page-container">
      <app-page-header title="Orders" subtitle="Track and manage sales orders">
        <button mat-flat-button color="primary" (click)="openNewOrder()">
          <mat-icon>add</mat-icon> New Order
        </button>
      </app-page-header>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="orders" class="w-100">

            <ng-container matColumnDef="orderNumber">
              <th mat-header-cell *matHeaderCellDef>Order #</th>
              <td mat-cell *matCellDef="let o"><strong>{{ o.orderNumber }}</strong></td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let o">{{ o.customerName }}</td>
            </ng-container>

            <ng-container matColumnDef="orderDate">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let o">{{ o.orderDate | date:'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let o">{{ o.totalAmount | currency:'MAD':'symbol':'1.2-2' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let o">
                <span class="status-chip" [class]="o.status?.toLowerCase()">{{ o.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let o">
                <button mat-icon-button (click)="openDetail(o)" matTooltip="View details">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button [matMenuTriggerFor]="statusMenu" matTooltip="Change status"
                        [disabled]="o.status === 'DELIVERED' || o.status === 'CANCELLED'">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #statusMenu="matMenu">
                  <button mat-menu-item (click)="updateStatus(o, 'CONFIRMED')" [disabled]="o.status !== 'PENDING'">
                    <mat-icon>check_circle</mat-icon> Confirm
                  </button>
                  <button mat-menu-item (click)="updateStatus(o, 'DELIVERED')" [disabled]="o.status !== 'CONFIRMED'">
                    <mat-icon>local_shipping</mat-icon> Mark Delivered
                  </button>
                  <button mat-menu-item (click)="updateStatus(o, 'CANCELLED')" [disabled]="o.status === 'DELIVERED'">
                    <mat-icon color="warn">cancel</mat-icon> Cancel
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <app-empty-state *ngIf="!orders.length" icon="receipt_long" title="No orders yet"
            message="Create your first order to get started">
            <button mat-flat-button color="primary" (click)="openNewOrder()">Create Order</button>
          </app-empty-state>

          <mat-paginator [length]="totalElements" [pageSize]="pageSize"
            [pageSizeOptions]="[5,10,25]" (page)="onPageChange($event)"></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .status-chip {
      padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize;
      &.pending   { background: #fff8e1; color: #f57f17; }
      &.confirmed { background: #e3f2fd; color: #1565c0; }
      &.delivered { background: #e8f5e9; color: #2e7d32; }
      &.cancelled { background: #fce4ec; color: #b71c1c; }
    }
  `]
})
export class OrdersListComponent implements OnInit {
  displayedColumns = ['orderNumber','customer','orderDate','totalAmount','status','actions'];
  orders: Order[] = [];
  loading       = false;
  totalElements = 0;
  pageSize      = 10;
  currentPage   = 0;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private dialog: MatDialog,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const tenantId = this.authService.getTenantId() ?? '';
    this.orderService.getAll(tenantId, this.currentPage, this.pageSize).subscribe({
      next: (page) => { this.orders = page.content; this.totalElements = page.totalElements; this.loading = false; },
      error: () => { this.loading = false; this.notification.error('Failed to load orders'); },
    });
  }

  onPageChange(e: PageEvent): void { this.currentPage = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openDetail(order: Order): void {
    this.dialog.open(OrderDetailDialogComponent, { width: '640px', data: { order } });
  }

  openNewOrder(): void {
    const ref = this.dialog.open(OrderDetailDialogComponent, {
      width: '640px', data: { order: null, tenantId: this.authService.getTenantId(), newMode: true },
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  updateStatus(order: Order, status: OrderStatus): void {
    const tenantId = this.authService.getTenantId() ?? '';
    this.orderService.updateStatus(order.id!, tenantId, status).subscribe({
      next: () => { this.notification.success(`Order ${status.toLowerCase()}`); this.load(); },
      error: () => this.notification.error('Failed to update order status'),
    });
  }
}
