import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { StockListComponent } from './stock-list/stock-list.component';
import { StockEditDialogComponent } from './stock-edit-dialog/stock-edit-dialog.component';

const routes: Routes = [
  { path: '', component: StockListComponent },
];

@NgModule({
  declarations: [StockListComponent, StockEditDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class StockModule {}
