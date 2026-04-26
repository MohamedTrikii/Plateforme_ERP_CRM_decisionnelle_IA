import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';

const routes: Routes = [
  { path: '', component: ProductsListComponent },
];

@NgModule({
  declarations: [ProductsListComponent, ProductFormDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ProductsModule {}
