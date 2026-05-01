import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MatCardModule }   from '@angular/material/card';
import { MatIconModule }   from '@angular/material/icon';
import { MatTableModule }  from '@angular/material/table';

import { SharedModule }       from '../../shared/shared.module';
import { AnalyticsComponent } from './analytics.component';
import { BaseChartDirective } from 'ng2-charts';

const routes: Routes = [
  { path: '', component: AnalyticsComponent },
];

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatIconModule,
    MatTableModule,
    SharedModule,
    BaseChartDirective,
    CurrencyPipe,
    DecimalPipe,
  ],
})
export class AnalyticsModule {}
