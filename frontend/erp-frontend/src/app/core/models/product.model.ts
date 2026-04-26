export interface Product {
  id?: number;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  costPrice?: number;
  category?: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stock {
  id?: number;
  product: Product;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  reorderQuantity: number;
  tenantId: string;
  availableQuantity?: number;
  lowStock?: boolean;
}
