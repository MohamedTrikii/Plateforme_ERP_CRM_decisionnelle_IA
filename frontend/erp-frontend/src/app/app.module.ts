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
 *
 * Route tree:
 *  /                     → public website (no auth)
 *  /home|about|services|gallery|contact → public pages (under PublicLayout)
 *  /auth/login|register  → auth pages (no auth)
 *  /dashboard|customers|products|orders|stock|analytics → ERP shell (authGuard)
 *  /admin                → admin panel (authGuard + adminGuard)
 */
const routes: Routes = [
  // ── Public website (no auth) ──────────────────────────────────────────────
  {
    path: '',
    loadChildren: () =>
      import('./features/public/public.module').then(m => m.PublicModule),
  },

  // ── Auth pages ────────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule),
  },

  // ── Protected ERP shell ───────────────────────────────────────────────────
  {
    path: 'app',
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
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.module').then(m => m.CustomersModule),
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
        path: 'stock',
        loadChildren: () =>
          import('./features/stock/stock.module').then(m => m.StockModule),
      },
      {
        path: 'analytics',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/analytics/analytics.module').then(m => m.AnalyticsModule),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./modules/admin/admin.module').then(m => m.AdminModule),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
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
