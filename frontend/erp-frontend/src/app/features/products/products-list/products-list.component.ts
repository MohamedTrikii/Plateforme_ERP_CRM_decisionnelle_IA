import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Product, ProductService } from '../product.service';
import { ProductFormDialogComponent } from '../product-form-dialog/product-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-products-list',
  template: `
    <div class="page-container">
      <app-page-header title="Products" subtitle="Manage your product catalog">
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> New Product
        </button>
      </app-page-header>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search by name or SKU</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (input)="onSearch($event)" placeholder="Search...">
      </mat-form-field>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="products" class="w-100">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let p">
                <strong>{{ p.name }}</strong>
                <br><small class="text-muted">{{ p.sku }}</small>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let p">{{ p.category || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let p">{{ p.price | currency:'MAD':'symbol':'1.2-2' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <span class="status-chip" [class]="p.status?.toLowerCase()">{{ p.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button (click)="openForm(p)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="delete(p)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <app-empty-state *ngIf="!products.length" icon="inventory_2" title="No products" message="Add your first product">
            <button mat-flat-button color="primary" (click)="openForm()">Add Product</button>
          </app-empty-state>

          <mat-paginator [length]="totalElements" [pageSize]="pageSize"
            [pageSizeOptions]="[5,10,25]" (page)="onPageChange($event)"></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .search-field   { width: 100%; margin-bottom: 16px; }
    .text-muted     { color: var(--text-secondary); font-size: 12px; }
    .status-chip {
      padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
      &.active       { background: #e8f5e9; color: #388e3c; }
      &.inactive     { background: #fce4ec; color: #c62828; }
      &.discontinued { background: #f5f5f5; color: #616161; }
    }
  `]
})
export class ProductsListComponent implements OnInit {
  displayedColumns = ['name','category','price','status','actions'];
  products: Product[] = [];
  loading       = false;
  totalElements = 0;
  pageSize      = 10;
  currentPage   = 0;
  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private dialog: MatDialog,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(q => { this.currentPage = 0; this.load(q); });
    this.load();
  }

  load(search?: string): void {
    this.loading = true;
    const tenantId = this.authService.getTenantId() ?? '';
    this.productService.getAll(tenantId, this.currentPage, this.pageSize, search).subscribe({
      next: (page) => { this.products = page.content; this.totalElements = page.totalElements; this.loading = false; },
      error: () => { this.loading = false; this.notification.error('Failed to load products'); },
    });
  }

  onSearch(e: Event): void { this.searchSubject.next((e.target as HTMLInputElement).value); }

  onPageChange(e: PageEvent): void { this.currentPage = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  openForm(product?: Product): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      width: '560px', data: { product, tenantId: this.authService.getTenantId() },
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(product: Product): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Product', message: `Delete "${product.name}"?`, danger: true, confirmLabel: 'Delete' },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.productService.delete(product.id!, this.authService.getTenantId() ?? '').subscribe({
        next: () => { this.notification.success('Product deleted'); this.load(); },
        error: () => this.notification.error('Failed to delete product'),
      });
    });
  }
}
