import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { StockItem, StockService } from '../stock.service';
import { StockEditDialogComponent } from '../stock-edit-dialog/stock-edit-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-stock-list',
  template: `
    <div class="page-container">
      <app-page-header title="Inventory" subtitle="Monitor and manage stock levels">
        <mat-chip-set>
          <mat-chip [highlighted]="showLowOnly" (click)="toggleLowOnly()" color="warn">
            <mat-icon matChipAvatar>warning</mat-icon>
            Low Stock ({{ lowStockCount }})
          </mat-chip>
        </mat-chip-set>
      </app-page-header>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="displayItems" class="w-100">

            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let s">
                <strong>{{ s.productName }}</strong>
                <br><small>{{ s.productSku }}</small>
              </td>
            </ng-container>

            <ng-container matColumnDef="onHand">
              <th mat-header-cell *matHeaderCellDef>On Hand</th>
              <td mat-cell *matCellDef="let s">{{ s.quantityOnHand }}</td>
            </ng-container>

            <ng-container matColumnDef="reserved">
              <th mat-header-cell *matHeaderCellDef>Reserved</th>
              <td mat-cell *matCellDef="let s">{{ s.quantityReserved }}</td>
            </ng-container>

            <ng-container matColumnDef="available">
              <th mat-header-cell *matHeaderCellDef>Available</th>
              <td mat-cell *matCellDef="let s" [class.low-stock]="s.lowStock">
                <strong>{{ s.availableQuantity ?? (s.quantityOnHand - s.quantityReserved) }}</strong>
                <mat-icon *ngIf="s.lowStock" class="warn-icon" matTooltip="Low stock">warning</mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="reorderLevel">
              <th mat-header-cell *matHeaderCellDef>Reorder At</th>
              <td mat-cell *matCellDef="let s">{{ s.reorderLevel }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button (click)="openEdit(s)" matTooltip="Adjust stock">
                  <mat-icon>tune</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"
              [class.low-stock-row]="row.lowStock"></tr>
          </table>

          <app-empty-state *ngIf="!displayItems.length" icon="warehouse"
            title="No inventory items" message="Add products first to see their stock here"></app-empty-state>

          <mat-paginator [length]="totalElements" [pageSize]="pageSize"
            [pageSizeOptions]="[5,10,25]" (page)="onPageChange($event)"></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .low-stock      { color: #f44336; display: flex; align-items: center; gap: 4px; }
    .warn-icon      { font-size: 16px; width: 16px; height: 16px; color: #f44336; }
    .low-stock-row  { background: #fff8f8; }
    small           { color: var(--text-secondary); font-size: 12px; }
  `]
})
export class StockListComponent implements OnInit {
  displayedColumns = ['product','onHand','reserved','available','reorderLevel','actions'];
  items: StockItem[] = [];
  lowStockItems: StockItem[] = [];
  loading       = false;
  totalElements = 0;
  pageSize      = 10;
  currentPage   = 0;
  showLowOnly   = false;
  lowStockCount = 0;

  get displayItems(): StockItem[] {
    return this.showLowOnly ? this.lowStockItems : this.items;
  }

  constructor(
    private stockService: StockService,
    private authService: AuthService,
    private dialog: MatDialog,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const tenantId = this.authService.getTenantId() ?? '';

    this.stockService.getAll(tenantId, this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.items         = page.content;
        this.totalElements = page.totalElements;
        this.loading       = false;
      },
      error: () => { this.loading = false; this.notification.error('Failed to load inventory'); },
    });

    this.stockService.getLowStock(tenantId).subscribe({
      next: (items) => { this.lowStockItems = items; this.lowStockCount = items.length; },
    });
  }

  onPageChange(e: PageEvent): void { this.currentPage = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  toggleLowOnly(): void { this.showLowOnly = !this.showLowOnly; }

  openEdit(item: StockItem): void {
    const ref = this.dialog.open(StockEditDialogComponent, {
      width: '400px', data: { item, tenantId: this.authService.getTenantId() },
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }
}
