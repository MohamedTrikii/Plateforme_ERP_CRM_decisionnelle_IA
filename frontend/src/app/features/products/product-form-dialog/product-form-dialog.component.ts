import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product, ProductService } from '../product.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
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
          <mat-select formControlName="category">
            <mat-option [value]="''">None</mat-option>
            <mat-option *ngFor="let category of categories" [value]="category">{{ category }}</mat-option>
          </mat-select>
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
  readonly defaultCategories = ['Electronics', 'Office Supplies', 'Furniture', 'Food', 'Services'];
  categories: string[] = [];

  form = this.fb.group({
    name:        ['', Validators.required],
    sku:         ['', Validators.required],
    price:       [null, [Validators.required, Validators.min(0)]],
    costPrice:   [null],
    category:    [''],
    description: [''],
    imageUrl:    [''],
    status:      ['ACTIVE'],
  });
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product; tenantId: string },
    readonly dialogRef: MatDialogRef<ProductFormDialogComponent>,
    private fb: FormBuilder,
    private productService: ProductService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.categories = [...this.defaultCategories];
    if (this.data.product) this.form.patchValue(this.data.product as any);
    this.includeCategoryInList(this.data.product?.category);
    this.loadCategories();
  }

  private loadCategories(): void {
    this.productService.getCategories(this.data.tenantId).subscribe({
      next: (categories) => {
        this.categories = this.mergeCategories(categories);
        this.includeCategoryInList(this.data.product?.category);
      },
      error: () => {
        this.categories = this.mergeCategories([]);
        this.includeCategoryInList(this.data.product?.category);
      },
    });
  }

  private mergeCategories(categories: string[]): string[] {
    return [...new Set([...this.defaultCategories, ...categories])].sort((a, b) => a.localeCompare(b));
  }

  private includeCategoryInList(category?: string): void {
    const value = category?.trim();
    if (!value) return;
    if (this.categories.includes(value)) return;
    this.categories = [...this.categories, value].sort((a, b) => a.localeCompare(b));
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload: Product = { ...this.form.value as any, tenantId: this.data.tenantId };
    const op = this.data.product
      ? this.productService.update(this.data.product.id!, payload)
      : this.productService.create(payload);

    op.subscribe({
      next: () => { this.notification.success(`Product ${this.data.product ? 'updated' : 'created'}`); this.dialogRef.close(true); },
      error: (err) => { this.saving = false; this.notification.error(err?.error?.detail ?? 'Operation failed'); },
    });
  }
}
