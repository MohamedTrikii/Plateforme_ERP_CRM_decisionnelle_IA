import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StockItem, StockService } from '../stock.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-stock-edit-dialog',
  template: `
    <h2 mat-dialog-title>Adjust Stock — {{ data.item.productName }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Quantity On Hand *</mat-label>
          <input matInput formControlName="quantityOnHand" type="number" min="0">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Reorder Level</mat-label>
          <input matInput formControlName="reorderLevel" type="number" min="0">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Reorder Quantity</mat-label>
          <input matInput formControlName="reorderQuantity" type="number" min="1">
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
  styles: [`.dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 320px; }`]
})
export class StockEditDialogComponent {
  form = this.fb.group({
    quantityOnHand:  [this.data.item.quantityOnHand,  [Validators.required, Validators.min(0)]],
    reorderLevel:    [this.data.item.reorderLevel,    Validators.min(0)],
    reorderQuantity: [this.data.item.reorderQuantity, Validators.min(1)],
  });
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { item: StockItem; tenantId: string },
    readonly dialogRef: MatDialogRef<StockEditDialogComponent>,
    private fb: FormBuilder,
    private stockService: StockService,
    private notification: NotificationService,
  ) {}

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.stockService.update(this.data.item.id!, { ...this.form.value as any, tenantId: this.data.tenantId }).subscribe({
      next: () => { this.notification.success('Stock updated'); this.dialogRef.close(true); },
      error: () => { this.saving = false; this.notification.error('Failed to update stock'); },
    });
  }
}
