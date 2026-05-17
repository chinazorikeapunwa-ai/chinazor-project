import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { assignedTo, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deleted: false };

    if (assignedTo) {
      where.assignedTo = assignedTo as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get clients error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients',
    });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    logger.error('Get client error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client',
    });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address, businessType, creditLimit, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Client name is required',
      });
    }

    const client = await prisma.client.create({
      data: {
        name,
        phone,
        email,
        address,
        businessType,
        creditLimit: creditLimit ? BigInt(Math.round(creditLimit * 100)) : null,
        notes,
        assignedTo: req.user?.userId,
      },
    });

    logger.info('Client created', { clientId: client.id, name });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    logger.error('Create client error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create client',
    });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, businessType, creditLimit, notes, clientVersion } = req.body;

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Version check for conflict detection
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

    const updated = await prisma.client.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        address,
        businessType,
        creditLimit: creditLimit ? BigInt(Math.round(creditLimit * 100)) : null,
        notes,
        version: { increment: 1 },
      },
    });

    logger.info('Client updated', { clientId: id });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Update client error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update client',
    });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await prisma.client.update({
      where: { id },
      data: { deleted: true, version: { increment: 1 } },
    });

    logger.info('Client deleted', { clientId: id });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Delete client error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client',
    });
  }
});

export default router;