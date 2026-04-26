import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-form',
  template: `
    <mat-card style="max-width:600px;margin:0 auto">
      <mat-card-header><mat-card-title>{{ editId ? 'Edit' : 'New' }} Product</mat-card-title></mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline"><mat-label>Name</mat-label>
            <input matInput formControlName="name" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>SKU</mat-label>
            <input matInput formControlName="sku" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Category</mat-label>
            <input matInput formControlName="category" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Price</mat-label>
            <input matInput type="number" formControlName="price" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Cost Price</mat-label>
            <input matInput type="number" formControlName="costPrice" /></mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="INACTIVE">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column:1/-1"><mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button routerLink="/products">Cancel</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid||saving">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class ProductFormComponent implements OnInit {

  form!:    FormGroup;
  editId:   number | null = null;
  saving  = false;

  constructor(
    private fb:      FormBuilder,
    private route:   ActivatedRoute,
    private router:  Router,
    private service: ProductService,
    private snack:   MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        ['', Validators.required],
      sku:         ['', Validators.required],
      description: [''],
      price:       [0, Validators.required],
      costPrice:   [0],
      category:    [''],
      imageUrl:    [''],
      status:      ['ACTIVE'],
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = +id;
      this.service.getById(this.editId).subscribe(p => this.form.patchValue(p));
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const obs = this.editId
      ? this.service.update(this.editId, this.form.value)
      : this.service.create(this.form.value);
    obs.subscribe({
      next: () => { this.snack.open('Saved!', 'Close', {duration:3000}); this.router.navigate(['/products']); },
      error: () => this.saving = false,
    });
  }
}
