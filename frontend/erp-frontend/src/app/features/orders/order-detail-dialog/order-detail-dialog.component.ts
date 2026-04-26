import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { Order, OrderService } from '../order.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-order-detail-dialog',
  template: `
    <!-- VIEW MODE -->
    <ng-container *ngIf="!data.newMode">
      <h2 mat-dialog-title>Order {{ data.order?.orderNumber }}</h2>
      <mat-dialog-content>
        <div class="detail-grid">
          <div class="detail-row"><span>Customer</span><strong>{{ data.order?.customerName }}</strong></div>
          <div class="detail-row"><span>Date</span><strong>{{ data.order?.orderDate | date:'dd/MM/yyyy' }}</strong></div>
          <div class="detail-row"><span>Status</span><strong>{{ data.order?.status }}</strong></div>
          <div class="detail-row"><span>Total</span><strong>{{ data.order?.totalAmount | currency:'MAD':'symbol':'1.2-2' }}</strong></div>
        </div>
        <mat-divider class="my-16"></mat-divider>
        <h3>Items</h3>
        <table mat-table [dataSource]="data.order?.items ?? []" class="w-100">
          <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let i">{{ i.productName }}</td></ng-container>
          <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef>Qty</th><td mat-cell *matCellDef="let i">{{ i.quantity }}</td></ng-container>
          <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Unit Price</th><td mat-cell *matCellDef="let i">{{ i.unitPrice | currency:'MAD':'symbol':'1.2-2' }}</td></ng-container>
          <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let i">{{ i.lineTotal | currency:'MAD':'symbol':'1.2-2' }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="['product','qty','price','total']"></tr>
          <tr mat-row *matRowDef="let r; columns: ['product','qty','price','total']"></tr>
        </table>
        <p *ngIf="data.order?.notes" class="notes">Notes: {{ data.order?.notes }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Close</button>
      </mat-dialog-actions>
    </ng-container>

    <!-- CREATE MODE -->
    <ng-container *ngIf="data.newMode">
      <h2 mat-dialog-title>New Order</h2>
      <mat-dialog-content>
        <form [formGroup]="orderForm" class="dialog-form">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Customer ID *</mat-label>
            <input matInput formControlName="customerId" type="number">
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

          <h4>Items</h4>
          <div formArrayName="items">
            <div *ngFor="let item of itemControls.controls; let i = index" [formGroupName]="i" class="item-row">
              <mat-form-field appearance="outline">
                <mat-label>Product ID</mat-label>
                <input matInput formControlName="productId" type="number">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Qty</mat-label>
                <input matInput formControlName="quantity" type="number" min="1">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Unit Price</mat-label>
                <input matInput formControlName="unitPrice" type="number" min="0">
              </mat-form-field>
              <button mat-icon-button color="warn" (click)="removeItem(i)" type="button"><mat-icon>remove_circle</mat-icon></button>
            </div>
          </div>
          <button mat-stroked-button (click)="addItem()" type="button">
            <mat-icon>add</mat-icon> Add Item
          </button>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(false)">Cancel</button>
        <button mat-flat-button color="primary" (click)="submit()" [disabled]="orderForm.invalid || saving">
          {{ saving ? 'Creating…' : 'Create Order' }}
        </button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: [`
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-row { display: flex; flex-direction: column; gap: 2px; span { color: var(--text-secondary); font-size: 12px; } }
    .my-16  { margin: 16px 0; }
    .notes  { color: var(--text-secondary); font-size: 14px; margin-top: 12px; }
    .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 480px; }
    .item-row { display: flex; align-items: center; gap: 8px; }
    .item-row mat-form-field { flex: 1; }
  `]
})
export class OrderDetailDialogComponent {
  orderForm = this.fb.group({
    customerId: [null, [Validators.required, Validators.min(1)]],
    notes: [''],
    items: this.fb.array([]),
  });
  saving = false;

  get itemControls() { return this.orderForm.get('items') as FormArray; }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { order?: Order | null; tenantId?: string; newMode?: boolean },
    readonly dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    private fb: FormBuilder,
    private orderService: OrderService,
    private notification: NotificationService,
  ) {}

  addItem(): void {
    this.itemControls.push(this.fb.group({
      productId: [null, [Validators.required, Validators.min(1)]],
      quantity:  [1,    [Validators.required, Validators.min(1)]],
      unitPrice: [0,    [Validators.required, Validators.min(0)]],
    }));
  }

  removeItem(i: number): void { this.itemControls.removeAt(i); }

  submit(): void {
    if (this.orderForm.invalid || !this.itemControls.length) return;
    this.saving = true;
    const val = this.orderForm.value;
    const order: Order = {
      customerId: val.customerId!,
      notes:      val.notes ?? '',
      tenantId:   this.data.tenantId,
      items:      val.items as any[],
    };
    this.orderService.create(order).subscribe({
      next: () => { this.notification.success('Order created'); this.dialogRef.close(true); },
      error: (err) => { this.saving = false; this.notification.error(err?.error?.detail ?? 'Failed to create order'); },
    });
  }
}
