// User model
export interface User {
  id?: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  tenantId: string;
  enabled: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  role: string;
  tenantId: string;
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  tenantId: string;
}
