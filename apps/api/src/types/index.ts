export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ConflictResolution {
  clientVersion: number;
  serverVersion: number;
  serverRecord: any;
  conflictResolved: boolean;
  strategy: 'client-wins' | 'server-wins' | 'manual';
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
