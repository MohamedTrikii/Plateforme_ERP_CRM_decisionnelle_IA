import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AdminService, AdminUser, UserRole } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-users-page',
  template: `
    <div class="page-container">
      <app-page-header title="Users" subtitle="Manage tenant users and roles"></app-page-header>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="users" class="w-100" *ngIf="users.length">
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Username</th>
              <td mat-cell *matCellDef="let user"><strong>{{ user.username }}</strong></td>
            </ng-container>

            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Full Name</th>
              <td mat-cell *matCellDef="let user">{{ user.fullName || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">
                <mat-form-field appearance="outline" class="role-field">
                  <mat-select
                    [value]="user.role"
                    (selectionChange)="changeRole(user, $event.value)"
                    [disabled]="isRowBusy(user.id)">
                    <mat-option *ngFor="let role of roles" [value]="role">{{ role }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </td>
            </ng-container>

            <ng-container matColumnDef="enabled">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">{{ user.enabled ? 'Active' : 'Disabled' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let user">
                <button
                  mat-stroked-button
                  color="primary"
                  (click)="toggleActive(user)"
                  [disabled]="isRowBusy(user.id)">
                  {{ user.enabled ? 'Disable' : 'Enable' }}
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <app-empty-state
            *ngIf="!users.length"
            icon="manage_accounts"
            title="No users found"
            message="No users were returned for this tenant.">
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
    `.role-field { width: 150px; margin: 6px 0; }`,
  ],
})
export class UsersComponent implements OnInit {
  displayedColumns = ['username', 'fullName', 'email', 'role', 'enabled', 'actions'];
  roles: UserRole[] = ['ADMIN', 'MANAGER', 'USER'];
  users: AdminUser[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  private readonly busyUserIds = new Set<number>();

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

  isRowBusy(userId: number): boolean {
    return this.busyUserIds.has(userId);
  }

  changeRole(user: AdminUser, role: UserRole): void {
    if (user.role === role || this.isRowBusy(user.id)) return;

    const oldRole = user.role;
    user.role = role;
    this.busyUserIds.add(user.id);
    this.adminService.changeUserRole(user.id, role).subscribe({
      next: (updated) => {
        user.role = updated.role;
        this.busyUserIds.delete(user.id);
        this.notification.success(`Role updated for ${user.username}`);
      },
      error: () => {
        user.role = oldRole;
        this.busyUserIds.delete(user.id);
        this.notification.error('Failed to update role');
      },
    });
  }

  toggleActive(user: AdminUser): void {
    if (this.isRowBusy(user.id)) return;

    this.busyUserIds.add(user.id);
    this.adminService.toggleUserActive(user.id).subscribe({
      next: (updated) => {
        user.enabled = updated.enabled;
        this.busyUserIds.delete(user.id);
        this.notification.success(`User ${updated.enabled ? 'enabled' : 'disabled'}`);
      },
      error: () => {
        this.busyUserIds.delete(user.id);
        this.notification.error('Failed to change user status');
      },
    });
  }

  private load(): void {
    this.loading = true;
    const tenantId = this.authService.getTenantId();
    this.adminService.listUsers(tenantId, this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.users = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load users');
      },
    });
  }
}
