import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { OrderDetailDialogComponent } from './order-detail-dialog/order-detail-dialog.component';

const routes: Routes = [
  { path: '', component: OrdersListComponent },
];

@NgModule({
  declarations: [OrdersListComponent, OrderDetailDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class OrdersModule {}
