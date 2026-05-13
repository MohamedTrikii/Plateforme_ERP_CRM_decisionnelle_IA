import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Customer, CustomerService } from '../customer.service';
import { CustomerFormDialogComponent } from '../customer-form-dialog/customer-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customers-list',
  template: `
    <div class="page-container">
      <app-page-header title="Customers" subtitle="Manage your customer base">
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> New Customer
        </button>
      </app-page-header>

      <!-- Search bar -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search customers</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (input)="onSearch($event)" placeholder="Name, email, company...">
      </mat-form-field>

      <!-- Loading -->
      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <!-- Table -->
      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="customers" class="w-100">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let c"><strong>{{ c.name }}</strong></td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let c">{{ c.email }}</td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let c">{{ c.phone || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="company">
              <th mat-header-cell *matHeaderCellDef>Company</th>
              <td mat-cell *matCellDef="let c">{{ c.company || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">
                <span class="status-chip" [class]="c.status?.toLowerCase()">{{ c.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c">
                <button mat-icon-button (click)="openForm(c)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button
                        color="warn"
                        [disabled]="!canDeleteCustomers()"
                        (click)="delete(c)"
                        [matTooltip]="canDeleteCustomers() ? 'Delete' : 'Delete requires ADMIN or MANAGER role'">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <app-empty-state *ngIf="!customers.length && !loading"
            icon="people" title="No customers found" message="Create your first customer to get started">
            <button mat-flat-button color="primary" (click)="openForm()">Add Customer</button>
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
    .status-chip {
      padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
      &.active    { background: #e8f5e9; color: #388e3c; }
      &.inactive  { background: #fce4ec; color: #c62828; }
      &.prospect  { background: #fff8e1; color: #f57f17; }
    }
  `]
})
export class CustomersListComponent implements OnInit {
  displayedColumns = ['name','email','phone','company','status','actions'];
  customers: Customer[] = [];
  loading       = false;
  totalElements = 0;
  pageSize      = 10;
  currentPage   = 0;
  private searchSubject = new Subject<string>();

  constructor(
    private customerService: CustomerService,
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
    this.customerService.getAll(tenantId, this.currentPage, this.pageSize, search).subscribe({
      next: (page) => {
        this.customers     = page.content;
        this.totalElements = page.totalElements;
        this.loading       = false;
      },
      error: () => { this.loading = false; this.notification.error('Failed to load customers'); },
    });
  }

  onSearch(e: Event): void {
    this.searchSubject.next((e.target as HTMLInputElement).value);
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize    = e.pageSize;
    this.load();
  }

  openForm(customer?: Customer): void {
    const ref = this.dialog.open(CustomerFormDialogComponent, {
      width: '520px', data: { customer, tenantId: this.authService.getTenantId() },
    });
    ref.afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(customer: Customer): void {
    if (!this.canDeleteCustomers()) {
      this.notification.error('You do not have permission to delete customers');
      return;
    }
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Customer', message: `Delete "${customer.name}"? This cannot be undone.`, danger: true, confirmLabel: 'Delete' },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.customerService.delete(customer.id!, this.authService.getTenantId() ?? '').subscribe({
        next: () => { this.notification.success('Customer deleted'); this.load(); },
        error: () => this.notification.error('Failed to delete customer'),
      });
    });
  }

  canDeleteCustomers(): boolean {
    return this.authService.isManagerOrAbove();
  }
}
