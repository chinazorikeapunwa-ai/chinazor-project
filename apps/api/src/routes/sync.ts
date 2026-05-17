import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { SyncService } from '../services/syncService';
import { SyncQueueItem } from '../types';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const syncService = new SyncService(prisma);

router.post('/batch', authMiddleware, async (req: Request, res: Response) => {
  try {
    const items: SyncQueueItem[] = req.body.items || [];

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array required',
      });
    }

    const results = await syncService.processSyncBatch(items, req.user?.userId || '');

    logger.info('Sync batch processed', { count: items.length, userId: req.user?.userId });

    res.json({
      success: true,
      data: {
        results,
        processed: results.filter((r: any) => r.success).length,
        failed: results.filter((r: any) => !r.success).length,
      },
    });
  } catch (error) {
    logger.error('Sync batch error', error);
    res.status(500).json({
      success: false,
      error: 'Sync batch failed',
    });
  }
});

router.get('/status/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const syncLogs = await prisma.syncLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    const lastSync = syncLogs[0]?.timestamp || null;
    const pendingCount = syncLogs.filter((log) => !log.conflictResolved).length;

    res.json({
      success: true,
      data: {
        lastSync,
        pendingCount,
        recentLogs: syncLogs.slice(0, 10),
      },
    });
  } catch (error) {
    logger.error('Get sync status error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sync status',
    });
  }
});

export default router;