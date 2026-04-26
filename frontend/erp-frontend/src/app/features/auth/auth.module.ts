import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent }    from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SharedModule }      from '../../shared/shared.module';

const routes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '',         redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class AuthModule {}
