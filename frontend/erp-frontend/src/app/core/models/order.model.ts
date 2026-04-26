import { Product } from './product.model';
import { Customer } from './customer.model';

export interface OrderItem {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface Order {
  id?: number;
  orderNumber?: string;
  customer: Customer;
  orderDate?: string;
  expectedDeliveryDate?: string;
  items: OrderItem[];
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount?: number;
  notes?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface DashboardKpi {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  lowStockCount: number;
}
