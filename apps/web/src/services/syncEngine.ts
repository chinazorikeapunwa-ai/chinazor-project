import { getQueueItems, removeQueueItem, getOrders as getStoredOrders, getClients as getStoredClients } from '../db/orders';
import { syncBatch } from './api';
import { SyncQueueItem } from '../types';

export class SyncEngine {
  private isSyncing = false;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  async startSync(): Promise<any> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('Offline - queueing sync for when online');
      return;
    }

    this.isSyncing = true;

    try {
      const items = await getQueueItems();

      if (items.length === 0) {
        console.log('No items to sync');
        return { processed: 0, failed: 0 };
      }

      console.log(`Syncing ${items.length} items...`);

      const result = await syncBatch(items);

      // Remove successfully synced items from queue
      if (result.results) {
        for (const itemResult of result.results) {
          if (itemResult.success) {
            await removeQueueItem(itemResult.itemId);
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  scheduleRetry(itemId: string, retryCount: number) {
    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    const timeout = setTimeout(() => {
      this.startSync();
    }, delay);

    this.retryTimeouts.set(itemId, timeout);
  }

  cancelRetry(itemId: string) {
    const timeout = this.retryTimeouts.get(itemId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(itemId);
    }
  }
}

export const syncEngine = new SyncEngine();
