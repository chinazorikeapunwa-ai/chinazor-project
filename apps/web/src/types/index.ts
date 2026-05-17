export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'rep';
  name?: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  businessType?: string;
  assignedTo?: string;
  creditLimit?: number;
  notes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  category?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  clientId: string;
  client?: Client;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'submitted' | 'processing' | 'shipped' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
  createdBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  table: 'clients' | 'orders' | 'products';
  recordId: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
  priority: number;
}

export interface SyncStatus {
  synced: 'synced' | 'pending' | 'error' | 'conflict';
  version?: number;
  serverVersion?: number;
}

export interface ConflictData {
  clientVersion: number;
  serverVersion: number;
  serverRecord: any;
  conflictResolved: boolean;
  strategy: 'client-wins' | 'server-wins' | 'manual';
}
