import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../theme/theme.service';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls:  ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',   route: '/dashboard'  },
    { label: 'Customers',  icon: 'people',       route: '/customers'  },
    { label: 'Products',   icon: 'inventory_2',  route: '/products'   },
    { label: 'Orders',     icon: 'shopping_cart',route: '/orders'     },
    { label: 'Stock',      icon: 'warehouse',    route: '/stock'      },
    { label: 'Admin',      icon: 'settings',     route: '/admin/config', adminOnly: true },
  ];

  enabledModules: string[] = [];

  constructor(
    private themeService: ThemeService,
    public  authService:  AuthService
  ) {}

  ngOnInit(): void {
    this.enabledModules = this.themeService.getEnabledModules();
    // Dashboard and Admin are always shown
  }

  isVisible(item: NavItem): boolean {
    if (item.adminOnly) return this.authService.isAdmin();
    if (item.route === '/dashboard') return true;
    const module = item.route.replace('/', '');
    return this.enabledModules.length === 0 || this.enabledModules.includes(module);
  }
}
