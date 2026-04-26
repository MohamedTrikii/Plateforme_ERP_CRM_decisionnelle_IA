import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // ── Auth (no guard) ───────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then(m => m.AuthModule),
  },

  // ── Protected routes (require valid JWT) ──────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'customers',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/customers/customers.module').then(m => m.CustomersModule),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/products/products.module').then(m => m.ProductsModule),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/orders/orders.module').then(m => m.OrdersModule),
  },
  {
    path: 'stock',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/stock/stock.module').then(m => m.StockModule),
  },

  // ── Admin-only routes ─────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      import('./modules/admin/admin.module').then(m => m.AdminModule),
  },

  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
