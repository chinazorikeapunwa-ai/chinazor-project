import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, roleCheck } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const clients = new Set<any>();

router.get('/summary', authMiddleware, roleCheck(['manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: today } },
      include: { items: true },
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekOrders = await prisma.order.findMany({
      where: { createdAt: { gte: weekStart } },
    });

    const weekRevenue = weekOrders.reduce((sum, order) => sum + Number(order.total), 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthOrders = await prisma.order.findMany({
      where: { createdAt: { gte: monthStart } },
    });

    const monthRevenue = monthOrders.reduce((sum, order) => sum + Number(order.total), 0);

    const pendingOrders = await prisma.order.count({
      where: { status: { in: ['draft', 'submitted', 'processing'] } },
    });

    res.json({
      success: true,
      data: {
        todayRevenue,
        todayOrders: todayOrders.length,
        weekRevenue,
        monthRevenue,
        pendingOrders,
      },
    });
  } catch (error) {
    logger.error('Dashboard summary error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary',
    });
  }
});

router.get('/rep-performance', authMiddleware, roleCheck(['manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const reps = await prisma.user.findMany({
      where: { role: 'rep' },
    });

    const performance = await Promise.all(
      reps.map(async (rep) => {
        const orders = await prisma.order.findMany({
          where: { createdBy: rep.id },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

        return {
          repId: rep.id,
          repName: rep.name || rep.email,
          orderCount: orders.length,
          totalRevenue,
        };
      })
    );

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    logger.error('Rep performance error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rep performance',
    });
  }
});

router.get('/inventory-alerts', authMiddleware, roleCheck(['manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: prisma.product.fields.reorderLevel,
        },
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    logger.error('Inventory alerts error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory alerts',
    });
  }
});

router.get('/events', authMiddleware, roleCheck(['manager', 'admin']), (req: Request, res: Response) => {
  // Setup SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection message
  res.write('data: {"type":"connected","timestamp":' + Date.now() + '}\n\n');

  const client = { res, userId: req.user?.userId };
  clients.add(client);

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat ${Date.now()}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(client);
  });
});

// Function to broadcast events to all connected clients
export function broadcastEvent(data: any) {
  clients.forEach((client: any) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

export default router;