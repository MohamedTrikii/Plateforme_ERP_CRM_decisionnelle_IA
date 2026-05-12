import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Product, ProductService } from '../product.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule,
  ],
  selector: 'app-product-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.product ? 'Edit' : 'New' }} Product</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <div class="row-2">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Name *</mat-label>
            <input matInput formControlName="name">
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>SKU *</mat-label>
            <input matInput formControlName="sku">
          </mat-form-field>
        </div>
        <div class="row-2">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Sale Price *</mat-label>
            <input matInput formControlName="price" type="number" min="0">
            <span matPrefix>MAD&nbsp;</span>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Cost Price</mat-label>
            <input matInput formControlName="costPrice" type="number" min="0">
            <span matPrefix>MAD&nbsp;</span>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Category</mat-label>
          <input matInput formControlName="category">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="INACTIVE">Inactive</mat-option>
            <mat-option value="DISCONTINUED">Discontinued</mat-option>
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
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; min-width: 460px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  `]
})
export class ProductFormDialogComponent implements OnInit {
  form = this.fb.group({
    name:        ['', Validators.required],
    sku:         ['', Validators.required],
    price:       [null as number | null, [Validators.required, Validators.min(0)]],
    costPrice:   [null as number | null],
    category:    [''],
    description: [''],
    imageUrl:    [''],
    status:      ['ACTIVE'],
  });
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product; tenantId: string },
    readonly dialogRef: MatDialogRef<ProductFormDialogComponent>,
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly notification: NotificationService,
  ) {}

  ngOnInit(): void {
    if (this.data.product) this.form.patchValue(this.data.product as any);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload: Product = { ...(this.form.value as Product), tenantId: this.data.tenantId };
    const op = this.data.product
      ? this.productService.update(this.data.product.id!, payload)
      : this.productService.create(payload);

    op.subscribe({
      next: () => {
        this.notification.success(`Product ${this.data.product ? 'updated' : 'created'}`);
        this.dialogRef.close(true);
      },
      error: (err: { error?: { detail?: string } }) => {
        this.saving = false;
        this.notification.error(err?.error?.detail ?? 'Operation failed');
      },
    });
  }
}
