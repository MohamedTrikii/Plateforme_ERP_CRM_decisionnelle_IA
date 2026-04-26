import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CustomersListComponent } from './customers-list/customers-list.component';
import { CustomerFormDialogComponent } from './customer-form-dialog/customer-form-dialog.component';

const routes: Routes = [
  { path: '', component: CustomersListComponent },
];

@NgModule({
  declarations: [CustomersListComponent, CustomerFormDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class CustomersModule {}
