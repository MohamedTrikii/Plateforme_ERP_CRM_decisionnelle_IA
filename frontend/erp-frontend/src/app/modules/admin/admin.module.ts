import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule }     from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }    from '@angular/material/input';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SystemConfigComponent } from './system-config/system-config.component';

const routes: Routes = [
  { path: '',               redirectTo: 'config', pathMatch: 'full' },
  { path: 'config',         component: SystemConfigComponent },
];

@NgModule({
  declarations: [SystemConfigComponent],
  imports: [
    CommonModule, ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
  ],
})
export class AdminModule {}
