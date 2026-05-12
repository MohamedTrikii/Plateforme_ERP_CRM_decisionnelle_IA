import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule }      from '@angular/material/button';
import { MatCardModule }        from '@angular/material/card';
import { MatIconModule }        from '@angular/material/icon';
import { MatInputModule }       from '@angular/material/input';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatTableModule }       from '@angular/material/table';
import { MatPaginatorModule }   from '@angular/material/paginator';
import { MatSortModule }        from '@angular/material/sort';
import { MatDialogModule }      from '@angular/material/dialog';
import { MatSelectModule }      from '@angular/material/select';
import { MatChipsModule }       from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule }    from '@angular/material/snack-bar';
import { MatTooltipModule }     from '@angular/material/tooltip';
import { MatMenuModule }        from '@angular/material/menu';
import { MatBadgeModule }       from '@angular/material/badge';
import { MatDividerModule }     from '@angular/material/divider';
import { MatCheckboxModule }    from '@angular/material/checkbox';
import { MatDatepickerModule }  from '@angular/material/datepicker';
import { MatNativeDateModule }  from '@angular/material/core';

// Shared Components
import { StatCardComponent }     from './components/stat-card/stat-card.component';
import { PageHeaderComponent }   from './components/page-header/page-header.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent }   from './components/empty-state/empty-state.component';

const MATERIAL_MODULES = [
  MatButtonModule, MatCardModule, MatIconModule, MatInputModule,
  MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule,
  MatDialogModule, MatSelectModule, MatChipsModule, MatProgressSpinnerModule,
  MatProgressBarModule, MatSnackBarModule, MatTooltipModule, MatMenuModule,
  MatBadgeModule, MatDividerModule, MatCheckboxModule, MatDatepickerModule,
  MatNativeDateModule,
];

const SHARED_COMPONENTS = [
  StatCardComponent, PageHeaderComponent, ConfirmDialogComponent,
  LoadingSpinnerComponent, EmptyStateComponent,
];

@NgModule({
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    ...MATERIAL_MODULES,
    ...SHARED_COMPONENTS,  // Import standalone components
  ],
  exports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    ...MATERIAL_MODULES,
    ...SHARED_COMPONENTS,
  ],
})
export class SharedModule {}
