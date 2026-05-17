import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, roleCheck } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, repId, dateFrom, dateTo, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    if (repId) {
      where.createdBy = repId as string;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        include: { client: true, user: true, items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get orders error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { client: true, user: true, items: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error('Get order error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { clientId, items, subtotal, tax, discount, total, paymentMethod, notes } = req.body;

    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Client and items required',
      });
    }

    const order = await prisma.order.create({
      data: {
        clientId,
        createdBy: req.user?.userId || '',
        subtotal,
        tax: tax || 0,
        discount: discount || 0,
        total,
        status: 'draft',
        paymentMethod,
        notes,
        items: {
          create: items,
        },
      },
      include: { items: true, client: true, user: true },
    });

    logger.info('Order created', { orderId: order.id, clientId });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error('Create order error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { clientId, items, subtotal, tax, discount, total, paymentMethod, notes, clientVersion } = req.body;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    if (clientVersion !== undefined && existing.version !== clientVersion) {
      return res.status(409).json({
        success: false,
        error: 'Version conflict',
        conflict: {
          clientVersion,
          serverVersion: existing.version,
          serverRecord: existing,
          strategy: 'server-wins',
        },
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        clientId,
        subtotal,
        tax: tax || 0,
        discount: discount || 0,
        total,
        paymentMethod,
        notes,
        version: { increment: 1 },
        items: {
          deleteMany: {},
          create: items || [],
        },
      },
      include: { items: true, client: true, user: true },
    });

    logger.info('Order updated', { orderId: id });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Update order error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order',
    });
  }
});

router.put('/:id/status', authMiddleware, roleCheck(['manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        notes: notes ? `${notes}` : undefined,
        version: { increment: 1 },
      },
      include: { items: true, client: true, user: true },
    });

    logger.info('Order status updated', { orderId: id, status });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Update order status error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
    });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'cancelled', version: { increment: 1 } },
      include: { items: true },
    });

    logger.info('Order cancelled', { orderId: id });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Delete order error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete order',
    });
  }
});

export default router;