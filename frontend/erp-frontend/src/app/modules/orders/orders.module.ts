import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule }      from '@angular/material/table';
import { MatPaginatorModule }  from '@angular/material/paginator';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatChipsModule }      from '@angular/material/chips';
import { MatSelectModule }     from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule }   from '@angular/material/snack-bar';

import { OrderListComponent } from './order-list/order-list.component';

const routes: Routes = [
  { path: '', component: OrderListComponent },
];

@NgModule({
  declarations: [OrderListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule,
    MatChipsModule, MatSelectModule,
    MatProgressBarModule, MatSnackBarModule,
  ],
})
export class OrdersModule {}
