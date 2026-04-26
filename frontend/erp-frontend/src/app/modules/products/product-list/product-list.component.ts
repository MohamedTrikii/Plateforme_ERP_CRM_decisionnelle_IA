import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-list',
  template: `
    <div class="page-header">
      <h2>Products</h2>
      <button mat-raised-button color="primary" routerLink="new">
        <mat-icon>add</mat-icon> New Product
      </button>
    </div>

    <div class="table-container mat-elevation-z4">
      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      <table mat-table [dataSource]="products">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let p">{{ p.name }}</td>
        </ng-container>
        <ng-container matColumnDef="sku">
          <th mat-header-cell *matHeaderCellDef>SKU</th>
          <td mat-cell *matCellDef="let p">{{ p.sku }}</td>
        </ng-container>
        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let p">{{ p.category }}</td>
        </ng-container>
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let p">{{ p.price | currency }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let p">{{ p.status }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let p">
            <button mat-icon-button [routerLink]="[p.id, 'edit']"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(p.id)"><mat-icon>delete</mat-icon></button>
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
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  total    = 0;
  page     = 0;
  loading  = false;
  cols     = ['name', 'sku', 'category', 'price', 'status', 'actions'];

  constructor(private service: ProductService, private snack: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll(this.page).subscribe({
      next: p => { this.products = p.content; this.total = p.totalElements; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  onPage(e: any): void { this.page = e.pageIndex; this.load(); }

  delete(id: number): void {
    if (!confirm('Delete?')) return;
    this.service.delete(id).subscribe(() => { this.snack.open('Deleted', 'Close', {duration:3000}); this.load(); });
  }
}
