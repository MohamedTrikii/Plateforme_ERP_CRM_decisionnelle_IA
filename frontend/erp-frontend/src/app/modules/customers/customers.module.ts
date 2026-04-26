import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule }    from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatCardModule }     from '@angular/material/card';
import { MatSelectModule }   from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';

const routes: Routes = [
  { path: '',          component: CustomerListComponent },
  { path: 'new',       component: CustomerFormComponent },
  { path: ':id/edit',  component: CustomerFormComponent },
];

@NgModule({
  declarations: [CustomerListComponent, CustomerFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule,
    MatCardModule, MatSelectModule,
    MatProgressBarModule, MatSnackBarModule,
  ],
})
export class CustomersModule {}
