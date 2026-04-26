import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule }      from '@angular/material/table';
import { MatPaginatorModule }  from '@angular/material/paginator';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { StockListComponent } from './stock-list/stock-list.component';

const routes: Routes = [{ path: '', component: StockListComponent }];

@NgModule({
  declarations: [StockListComponent],
  imports: [
    CommonModule, RouterModule.forChild(routes),
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatProgressBarModule,
  ],
})
export class StockModule {}
