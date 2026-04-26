export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CustomerPage {
  content: Customer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
