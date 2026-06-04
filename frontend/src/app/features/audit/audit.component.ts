import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AdminService, AuditLog } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-audit-page',
  template: `
    <div class="page-container">
      <app-page-header title="Audit Logs" subtitle="Track who changed what and when"></app-page-header>

      <mat-card class="filters-card">
        <mat-card-content class="filters-grid">
          <mat-form-field appearance="outline">
            <mat-label>Entity</mat-label>
            <input matInput [(ngModel)]="entityFilter" placeholder="Customer, Product...">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Action</mat-label>
            <mat-select [(ngModel)]="actionFilter" (selectionChange)="applyLocalFilters()">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let action of actions" [value]="action">{{ action }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>From</mat-label>
            <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate" (dateChange)="applyLocalFilters()">
            <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>To</mat-label>
            <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate" (dateChange)="applyLocalFilters()">
            <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>

          <div class="filters-actions">
            <button mat-stroked-button (click)="resetFilters()">Reset</button>
            <button mat-flat-button color="primary" (click)="load()">Apply</button>
          </div>
        </mat-card-content>
      </mat-card>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="logs" class="w-100" *ngIf="logs.length">
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef>Timestamp</th>
              <td mat-cell *matCellDef="let log">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
            </ng-container>

            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let log">{{ log.action }}</td>
            </ng-container>

            <ng-container matColumnDef="entityName">
              <th mat-header-cell *matHeaderCellDef>Entity</th>
              <td mat-cell *matCellDef="let log">{{ log.entityName }} #{{ log.entityId || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="performedBy">
              <th mat-header-cell *matHeaderCellDef>Performed By</th>
              <td mat-cell *matCellDef="let log">{{ log.performedBy || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let log">{{ log.description || '-' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <app-empty-state
            *ngIf="!logs.length"
            icon="history"
            title="No audit entries"
            message="No audit logs were returned for this tenant.">
          </app-empty-state>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5,10,25]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.page-container { padding: 24px; }`,
    `.filters-card { margin-bottom: 16px; }`,
    `.filters-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; align-items: end; }`,
    `.filters-actions { display: flex; gap: 8px; justify-content: flex-end; }`,
    `@media (max-width: 1100px) { .filters-grid { grid-template-columns: 1fr 1fr; } }`,
  ],
})
export class AuditComponent implements OnInit {
  displayedColumns = ['timestamp', 'action', 'entityName', 'performedBy', 'description'];
  readonly actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'CONFIG_CHANGE'];

  logs: AuditLog[] = [];
  rawLogs: AuditLog[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  entityFilter = '';
  actionFilter = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  resetFilters(): void {
    this.entityFilter = '';
    this.actionFilter = '';
    this.fromDate = null;
    this.toDate = null;
    this.currentPage = 0;
    this.load();
  }

  applyLocalFilters(): void {
    this.logs = this.rawLogs.filter((log) => {
      if (this.actionFilter && log.action !== this.actionFilter) return false;

      const eventDate = new Date(log.timestamp);
      if (this.fromDate) {
        const from = new Date(this.fromDate);
        from.setHours(0, 0, 0, 0);
        if (eventDate < from) return false;
      }
      if (this.toDate) {
        const to = new Date(this.toDate);
        to.setHours(23, 59, 59, 999);
        if (eventDate > to) return false;
      }
      return true;
    });
  }

  load(): void {
    this.loading = true;
    const tenantId = this.authService.getTenantId();
    const entity = this.entityFilter.trim();
    const request$ = entity
      ? this.adminService.listAuditLogsByEntity(tenantId, entity, this.currentPage, this.pageSize)
      : this.adminService.listAuditLogs(tenantId, this.currentPage, this.pageSize);

    request$.subscribe({
      next: (page) => {
        this.rawLogs = page.content;
        this.applyLocalFilters();
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load audit logs');
      },
    });
  }
}
