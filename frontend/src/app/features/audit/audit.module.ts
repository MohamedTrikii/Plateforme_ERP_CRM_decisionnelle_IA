import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuditComponent } from './audit.component';

const routes: Routes = [{ path: '', component: AuditComponent }];

@NgModule({
  declarations: [AuditComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class AuditModule {}
