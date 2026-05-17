import { getDB } from './index';
import { Order, SyncQueueItem } from '../types';
import { v4 as uuid } from 'uuid';

export async function saveOrders(orders: Order[]) {
  const db = await getDB();
  const tx = db.transaction('orders', 'readwrite');

  for (const order of orders) {
    await tx.store.put({
      ...order,
      syncStatus: 'synced',
      localVersion: order.version,
      serverVersion: order.version,
    });
  }

  await tx.done;
}

export async function getOrders(): Promise<Order[]> {
  const db = await getDB();
  return db.getAll('orders');
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const db = await getDB();
  return db.get('orders', id);
}

export async function createOrder(data: Partial<Order>) {
  const db = await getDB();
  const order = {
    id: uuid(),
    ...data,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending' as const,
    localVersion: 1,
    serverVersion: 0,
  };

  await db.put('orders', order);
  return order;
}

export async function updateOrder(id: string, data: Partial<Order>) {
  const db = await getDB();
  const existing = await db.get('orders', id);

  if (!existing) throw new Error('Order not found');

  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending' as const,
    localVersion: existing.localVersion + 1,
  };

  await db.put('orders', updated);
  return updated;
}

export async function getOrdersByClient(clientId: string): Promise<Order[]> {
  const db = await getDB();
  return db.getAllFromIndex('orders', 'by-client', clientId);
}

export async function getOrdersByStatus(status: string): Promise<Order[]> {
  const db = await getDB();
  return db.getAllFromIndex('orders', 'by-status', status);
}

export async function getCurrentCart() {
  const db = await getDB();
  return db.get('cart', 'current') || { id: 'current', items: [], updatedAt: Date.now() };
}

export async function updateCart(items: any[]) {
  const db = await getDB();
  await db.put('cart', {
    id: 'current',
    items,
    updatedAt: Date.now(),
  });
}

export async function clearCart() {
  const db = await getDB();
  await db.put('cart', {
    id: 'current',
    items: [],
    updatedAt: Date.now(),
  });
}

export async function addQueueItem(item: SyncQueueItem) {
  const db = await getDB();
  await db.put('syncQueue', item);
}

export async function getQueueItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  const items = await db.getAll('syncQueue');
  return items.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
}

export async function removeQueueItem(id: string) {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function clearQueue() {
  const db = await getDB();
  await db.clear('syncQueue');
}
