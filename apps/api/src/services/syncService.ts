import { PrismaClient } from '@prisma/client';
import { SyncQueueItem, ConflictResolution } from '../types';
import { ConflictResolver } from './conflictResolver';
import { logger } from '../utils/logger';

export class SyncService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async processSyncBatch(items: SyncQueueItem[], userId: string) {
    const results = [];

    for (const item of items) {
      try {
        const result = await this.processQueueItem(item, userId);
        results.push(result);
      } catch (error) {
        logger.error('Error processing sync item', { item, error });
        results.push({
          success: false,
          itemId: item.id,
          error: (error as Error).message,
        });
      }
    }

    return results;
  }

  private async processQueueItem(item: SyncQueueItem, userId: string) {
    const { operation, table, recordId, payload } = item;

    logger.info(`Processing ${operation} on ${table}: ${recordId}`);

    if (operation === 'CREATE') {
      return this.handleCreate(table, payload, userId);
    } else if (operation === 'UPDATE') {
      return this.handleUpdate(table, recordId, payload, userId);
    } else if (operation === 'DELETE') {
      return this.handleDelete(table, recordId, userId);
    }
  }

  private async handleCreate(table: string, payload: any, userId: string) {
    if (table === 'clients') {
      const client = await this.prisma.client.create({
        data: {
          ...payload,
          assignedTo: payload.assignedTo || userId,
        },
      });

      await this.prisma.syncLog.create({
        data: {
          userId,
          tableName: table,
          recordId: client.id,
          operation: 'CREATE',
          payload: client,
          conflictResolved: true,
          conflictStrategy: 'none',
        },
      });

      return { success: true, record: client };
    }

    if (table === 'orders') {
      const order = await this.prisma.order.create({
        data: {
          ...payload,
          createdBy: userId,
          items: {
            create: payload.items || [],
          },
        },
        include: { items: true },
      });

      await this.prisma.syncLog.create({
        data: {
          userId,
          tableName: table,
          recordId: order.id,
          operation: 'CREATE',
          payload: order,
          conflictResolved: true,
          conflictStrategy: 'none',
        },
      });

      return { success: true, record: order };
    }

    throw new Error(`Unsupported table for CREATE: ${table}`);
  }

  private async handleUpdate(table: string, recordId: string, payload: any, userId: string) {
    const { clientVersion, ...updateData } = payload;

    if (table === 'clients') {
      const existing = await this.prisma.client.findUnique({ where: { id: recordId } });

      if (!existing) {
        // Record doesn't exist - create it as fallback
        return this.handleCreate(table, { ...updateData, id: recordId }, userId);
      }

      // Check for conflict
      if (clientVersion !== undefined && existing.version !== clientVersion) {
        const conflictResolution = ConflictResolver.resolve({
          clientVersion: clientVersion || 1,
          serverVersion: existing.version,
          clientTimestamp: new Date().getTime(),
          serverTimestamp: existing.updatedAt.getTime(),
          clientRecord: updateData,
          serverRecord: existing,
        });

        if (conflictResolution.strategy === 'server-wins') {
          return {
            success: false,
            conflict: conflictResolution,
            serverRecord: existing,
          };
        }
      }

      const updated = await this.prisma.client.update({
        where: { id: recordId },
        data: {
          ...updateData,
          version: { increment: 1 },
        },
      });

      await this.prisma.syncLog.create({
        data: {
          userId,
          tableName: table,
          recordId,
          operation: 'UPDATE',
          payload: updated,
          conflictResolved: true,
          conflictStrategy: 'none',
        },
      });

      return { success: true, record: updated };
    }

    if (table === 'orders') {
      const existing = await this.prisma.order.findUnique({
        where: { id: recordId },
        include: { items: true },
      });

      if (!existing) {
        return this.handleCreate(table, { ...updateData, id: recordId }, userId);
      }

      const updated = await this.prisma.order.update({
        where: { id: recordId },
        data: {
          ...updateData,
          version: { increment: 1 },
          items: {
            deleteMany: {},
            create: updateData.items || [],
          },
        },
        include: { items: true },
      });

      await this.prisma.syncLog.create({
        data: {
          userId,
          tableName: table,
          recordId,
          operation: 'UPDATE',
          payload: updated,
          conflictResolved: true,
          conflictStrategy: 'none',
        },
      });

      return { success: true, record: updated };
    }

    throw new Error(`Unsupported table for UPDATE: ${table}`);
  }

  private async handleDelete(table: string, recordId: string, userId: string) {
    if (table === 'clients') {
      const updated = await this.prisma.client.update({
        where: { id: recordId },
        data: { deleted: true, version: { increment: 1 } },
      });

      await this.prisma.syncLog.create({
        data: {
          userId,
          tableName: table,
          recordId,
          operation: 'DELETE',
          payload: updated,
          conflictResolved: true,
          conflictStrategy: 'none',
        },
      });

      return { success: true, record: updated };
    }

    if (table === 'orders') {
      const updated = await this.prisma.order.update({
        where: { id: recordId },
        data: { status: 'cancelled', version: { increment: 1 } },
        include: { items: true },
      });

      await this.prisma.syncLog.create({
        data: {
          userId,
          tableName: table,
          recordId,
          operation: 'DELETE',
          payload: updated,
          conflictResolved: true,
          conflictStrategy: 'none',
        },
      });

      return { success: true, record: updated };
    }

    throw new Error(`Unsupported table for DELETE: ${table}`);
  }
}