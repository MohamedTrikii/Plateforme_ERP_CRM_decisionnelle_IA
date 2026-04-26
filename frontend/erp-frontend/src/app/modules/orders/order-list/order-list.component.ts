import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-list',
  template: `
    <div class="page-header">
      <h2>Orders</h2>
    </div>

    <div class="table-container mat-elevation-z4">
      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      <table mat-table [dataSource]="orders">
        <ng-container matColumnDef="orderNumber">
          <th mat-header-cell *matHeaderCellDef>Order #</th>
          <td mat-cell *matCellDef="let o">{{ o.orderNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="customer">
          <th mat-header-cell *matHeaderCellDef>Customer</th>
          <td mat-cell *matCellDef="let o">{{ o.customer?.name }}</td>
        </ng-container>
        <ng-container matColumnDef="orderDate">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let o">{{ o.orderDate | date }}</td>
        </ng-container>
        <ng-container matColumnDef="totalAmount">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let o">{{ o.totalAmount | currency }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let o">
            <mat-chip [color]="statusColor(o.status)" selected>{{ o.status }}</mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let o">
            <mat-select placeholder="Status" (selectionChange)="changeStatus(o.id, $event.value)"
                        style="width:120px; font-size:12px">
              <mat-option *ngFor="let s of statuses" [value]="s">{{ s }}</mat-option>
            </mat-select>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let r; columns: cols;"></tr>
      </table>
      <mat-paginator [length]="total" [pageSize]="10" [pageSizeOptions]="[5,10,25]" (page)="onPage($event)"></mat-paginator>
    </div>
  `,
  styles: [`.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px} h2{margin:0;color:var(--primary-color)} .table-container{overflow:auto;border-radius:8px}`]
})
export class OrderListComponent implements OnInit {

  orders:  Order[] = [];
  total    = 0;
  page     = 0;
  loading  = false;
  cols     = ['orderNumber', 'customer', 'orderDate', 'totalAmount', 'status', 'actions'];
  statuses = ['DRAFT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(private service: OrderService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll(this.page).subscribe({
      next: p => { this.orders = p.content; this.total = p.totalElements; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  onPage(e: any): void { this.page = e.pageIndex; this.load(); }

  changeStatus(id: number, status: string): void {
    this.service.updateStatus(id, status).subscribe({
      next: () => { this.snack.open('Status updated', 'Close', {duration:3000}); this.load(); },
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'accent', CONFIRMED: 'primary', SHIPPED: 'primary',
      DELIVERED: '', CANCELLED: 'warn',
    };
    return map[status] || '';
  }
}
