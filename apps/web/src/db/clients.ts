import { getDB } from './index';
import { Client, SyncStatus } from '../types';
import { v4 as uuid } from 'uuid';

export async function saveClients(clients: Client[]) {
  const db = await getDB();
  const tx = db.transaction('clients', 'readwrite');

  for (const client of clients) {
    await tx.store.put({
      ...client,
      syncStatus: 'synced',
      localVersion: client.version,
      serverVersion: client.version,
    });
  }

  await tx.done;
}

export async function getClients(): Promise<Client[]> {
  const db = await getDB();
  return db.getAll('clients');
}

export async function getClient(id: string): Promise<Client | undefined> {
  const db = await getDB();
  return db.get('clients', id);
}

export async function createClient(data: Partial<Client>) {
  const db = await getDB();
  const client = {
    id: uuid(),
    ...data,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    syncStatus: 'pending' as const,
    localVersion: 1,
    serverVersion: 0,
  };

  await db.put('clients', client);
  return client;
}

export async function updateClient(id: string, data: Partial<Client>) {
  const db = await getDB();
  const existing = await db.get('clients', id);

  if (!existing) throw new Error('Client not found');

  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending' as const,
    localVersion: existing.localVersion + 1,
  };

  await db.put('clients', updated);
  return updated;
}

export async function deleteClient(id: string) {
  const db = await getDB();
  const existing = await db.get('clients', id);

  if (!existing) throw new Error('Client not found');

  const updated = {
    ...existing,
    deleted: true,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending' as const,
    localVersion: existing.localVersion + 1,
  };

  await db.put('clients', updated);
  return updated;
}

export async function searchClients(query: string): Promise<Client[]> {
  const db = await getDB();
  const clients = await db.getAll('clients');
  const lowerQuery = query.toLowerCase();

  return clients.filter(
    (c) =>
      !c.deleted &&
      (c.name.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery))
  );
}

export async function getClientsByStatus(status: SyncStatus['synced']): Promise<Client[]> {
  const db = await getDB();
  return db.getAllFromIndex('clients', 'by-status', status);
}
