import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings-page',
  template: `
    <div class="page-container">
      <app-page-header title="Settings" subtitle="Tenant configuration values">
        <button mat-flat-button color="primary" (click)="saveAll()" [disabled]="saving || loading || !hasChanges">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </app-page-header>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="configEntries" class="w-100" *ngIf="configEntries.length">
            <ng-container matColumnDef="key">
              <th mat-header-cell *matHeaderCellDef>Key</th>
              <td mat-cell *matCellDef="let entry"><strong>{{ entry.key }}</strong></td>
            </ng-container>

            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef>Value</th>
              <td mat-cell *matCellDef="let entry">
                <mat-form-field appearance="outline" class="value-field">
                  <input
                    matInput
                    [ngModel]="draftMap[entry.key]"
                    (ngModelChange)="onValueChange(entry.key, $event)">
                </mat-form-field>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <app-empty-state
            *ngIf="!configEntries.length"
            icon="settings"
            title="No settings available"
            message="No tenant configuration keys were returned by the API.">
          </app-empty-state>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.page-container { padding: 24px; }`,
    `.value-field { width: 100%; margin: 6px 0; }`,
  ],
})
export class SettingsComponent implements OnInit {
  displayedColumns = ['key', 'value'];
  configEntries: Array<{ key: string; value: string }> = [];
  draftMap: Record<string, string> = {};
  originalMap: Record<string, string> = {};
  loading = false;
  saving = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get hasChanges(): boolean {
    return JSON.stringify(this.originalMap) !== JSON.stringify(this.draftMap);
  }

  onValueChange(key: string, value: string): void {
    this.draftMap[key] = value;
  }

  saveAll(): void {
    if (!this.hasChanges || this.saving) return;

    this.saving = true;
    const tenantId = this.authService.getTenantId();
    this.adminService.saveConfigMap(tenantId, this.draftMap).subscribe({
      next: () => {
        this.saving = false;
        this.originalMap = { ...this.draftMap };
        this.notification.success('Settings saved');
      },
      error: () => {
        this.saving = false;
        this.notification.error('Failed to save settings');
      },
    });
  }

  private load(): void {
    this.loading = true;
    const tenantId = this.authService.getTenantId();
    this.adminService.getConfigMap(tenantId).subscribe({
      next: (configMap) => {
        this.originalMap = { ...configMap };
        this.draftMap = { ...configMap };
        this.configEntries = Object.entries(configMap)
          .map(([key, value]) => ({ key, value }))
          .sort((a, b) => a.key.localeCompare(b.key));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load settings');
      },
    });
  }
}
