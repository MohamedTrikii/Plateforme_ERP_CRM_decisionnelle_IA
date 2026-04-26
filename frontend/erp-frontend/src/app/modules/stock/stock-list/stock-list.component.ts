import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../core/services/stock.service';
import { Stock } from '../../../core/models/product.model';

@Component({
  selector: 'app-stock-list',
  template: `
    <div class="page-header"><h2>Stock Levels</h2></div>
    <div class="table-container mat-elevation-z4">
      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      <table mat-table [dataSource]="stocks">
        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef>Product</th>
          <td mat-cell *matCellDef="let s">{{ s.product?.name }}</td>
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
          <td mat-cell *matCellDef="let s">{{ s.quantityOnHand - s.quantityReserved }}</td>
        </ng-container>
        <ng-container matColumnDef="reorderLevel">
          <th mat-header-cell *matHeaderCellDef>Reorder Level</th>
          <td mat-cell *matCellDef="let s">{{ s.reorderLevel }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let s">
            <span *ngIf="s.quantityOnHand <= s.reorderLevel" style="color:#C62828;font-weight:600">⚠ Low</span>
            <span *ngIf="s.quantityOnHand > s.reorderLevel"  style="color:#2E7D32;">OK</span>
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
export class StockListComponent implements OnInit {

  stocks:  Stock[] = [];
  total    = 0;
  page     = 0;
  loading  = false;
  cols     = ['product', 'onHand', 'reserved', 'available', 'reorderLevel', 'status'];

  constructor(private service: StockService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll(this.page).subscribe({
      next: p => { this.stocks = p.content; this.total = p.totalElements; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  onPage(e: any): void { this.page = e.pageIndex; this.load(); }
}
