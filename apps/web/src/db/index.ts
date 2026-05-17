import { DBSchema, openDB } from 'idb';
import { Product, Client, Order, SyncQueueItem } from '../types';

interface FieldSalesDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      email: string;
      role: string;
      name?: string;
      cachedAt: number;
    };
  };
  clients: {
    key: string;
    value: Client & {
      syncStatus: 'synced' | 'pending' | 'error' | 'conflict';
      localVersion: number;
      serverVersion: number;
    };
    indexes: { 'by-assigned': string; 'by-status': string };
  };
  products: {
    key: string;
    value: Product & { lastSynced: number };
    indexes: { 'by-category': string; 'by-sku': string };
  };
  orders: {
    key: string;
    value: Order & {
      syncStatus: 'synced' | 'pending' | 'error' | 'conflict';
      localVersion: number;
      serverVersion: number;
    };
    indexes: { 'by-client': string; 'by-status': string; 'by-user': string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-priority': number; 'by-timestamp': number };
  };
  cart: {
    key: string;
    value: {
      id: 'current';
      items: Array<{
        productId: string;
        productName: string;
        unitPrice: number;
        quantity: number;
      }>;
      updatedAt: number;
    };
  };
}

let db: any;

export async function initDB() {
  if (db) return db;

  db = await openDB<FieldSalesDB>('FieldSalesDB', 1, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }

      // Clients store
      if (!db.objectStoreNames.contains('clients')) {
        const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
        clientStore.createIndex('by-assigned', 'assignedTo');
        clientStore.createIndex('by-status', 'syncStatus');
      }

      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('by-category', 'category');
        productStore.createIndex('by-sku', 'sku');
      }

      // Orders store
      if (!db.objectStoreNames.contains('orders')) {
        const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
        orderStore.createIndex('by-client', 'clientId');
        orderStore.createIndex('by-status', 'status');
        orderStore.createIndex('by-user', 'createdBy');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-priority', 'priority');
        syncStore.createIndex('by-timestamp', 'timestamp');
      }

      // Cart store
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart', { keyPath: 'id' });
      }
    },
  });

  return db;
}

export async function getDB() {
  if (!db) {
    await initDB();
  }
  return db;
}

export async function clearAllData() {
  const database = await getDB();
  const tx = database.transaction(
    ['users', 'clients', 'products', 'orders', 'syncQueue', 'cart'],
    'readwrite'
  );
  await Promise.all([
    tx.objectStore('users').clear(),
    tx.objectStore('clients').clear(),
    tx.objectStore('products').clear(),
    tx.objectStore('orders').clear(),
    tx.objectStore('syncQueue').clear(),
    tx.objectStore('cart').clear(),
  ]);
}
