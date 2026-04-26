import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer, CustomerService } from '../customer.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customer-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.customer ? 'Edit' : 'New' }} Customer</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Name *</mat-label>
          <input matInput formControlName="name">
          <mat-error>Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Email *</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-error>Valid email required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Company</mat-label>
          <input matInput formControlName="company">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="INACTIVE">Inactive</mat-option>
            <mat-option value="PROSPECT">Prospect</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid || saving">
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.dialog-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; min-width: 420px; }`]
})
export class CustomerFormDialogComponent implements OnInit {
  form = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    phone:   [''],
    company: [''],
    address: [''],
    status:  ['ACTIVE'],
  });
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { customer?: Customer; tenantId: string },
    readonly dialogRef: MatDialogRef<CustomerFormDialogComponent>,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    if (this.data.customer) {
      this.form.patchValue(this.data.customer as any);
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload: Customer = { ...this.form.value as Customer, tenantId: this.data.tenantId };
    const op = this.data.customer
      ? this.customerService.update(this.data.customer.id!, payload)
      : this.customerService.create(payload);

    op.subscribe({
      next: () => {
        this.notification.success(`Customer ${this.data.customer ? 'updated' : 'created'}`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.notification.error(err?.error?.detail ?? 'Operation failed');
      },
    });
  }
}
