import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { CoreModule }   from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from './layout/layout.module';

import { ShellComponent } from './layout/shell/shell.component';

import { authGuard }  from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

import { jwtInterceptor }   from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/**
 * Application routes – lazy-loads each feature module.
 * Protected routes use authGuard; admin-only routes also use adminGuard.
 */
const routes: Routes = [
  // Aliases for direct links/bookmarks
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },

  // Auth routes (public)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule),
  },

  // Protected shell – all authenticated pages live here
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.module').then(m => m.ProductsModule),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.module').then(m => m.OrdersModule),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.module').then(m => m.CustomersModule),
      },
      {
        path: 'stock',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/stock/stock.module').then(m => m.StockModule),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    LayoutModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  providers: [
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
